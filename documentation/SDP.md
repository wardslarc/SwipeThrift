# SwipeThrift: Complete Development Plan v2.0

**Project Type:** Personal Portfolio / MVP  
**Architecture:** Monolithic Dockerized Application  
**Target Timeline:** 6-8 Weeks (Part-time)  
**Document ID:** SWIPE-PLAN-2026

## 1. Executive Summary

**SwipeThrift** is a Tinder-inspired marketplace for second-hand goods. It uses a **Credit Economy** to solve spam and ghosting.  
- **Buyers:** Swipe Right to auto-start a chat.  
- **Sellers:** Pay 20 credits to list an item.  
- **Economy:** Users earn +4 credits daily on login.

## 2. Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | Next.js 14 (App Router) + TypeScript | SSR for SEO, Client Components for Swipe UI |
| **Styling** | Tailwind CSS + Shadcn/ui | Rapid, accessible component library |
| **Animation** | Framer Motion | Physics-based card dragging (velocity, rotation) |
| **Backend** | Node.js + Express + TypeScript | REST API & Socket.io server |
| **Database** | MySQL 8 | Relational integrity for transactions |
| **Cache** | Redis | Daily login cooldown & session store |
| **Storage** | Local Disk (Docker Volume) | Mapped to persistent disk on VPS |
| **DevOps** | Docker Compose | Identical environment for dev and prod |
| **Proxy** | Nginx | SSL termination (Let's Encrypt) |

## 3. Database Schema (MySQL)

```sql
-- Users & Economy
CREATE TABLE users (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    credits INT DEFAULT 30 NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    last_login_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Listings
CREATE TABLE listings (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    seller_id CHAR(36) NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(50),
    status ENUM('ACTIVE', 'SOLD', 'DELETED') DEFAULT 'ACTIVE',
    images JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_seller_status (seller_id, status)
);

-- Swipe Tracking
CREATE TABLE swipes (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    listing_id CHAR(36) NOT NULL,
    direction ENUM('LEFT', 'RIGHT') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_swipe (user_id, listing_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE
);

-- Conversations
CREATE TABLE conversations (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    listing_id CHAR(36) NOT NULL,
    buyer_id CHAR(36) NOT NULL,
    seller_id CHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_convo (listing_id, buyer_id),
    FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE,
    FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Messages
CREATE TABLE messages (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    conversation_id CHAR(36) NOT NULL,
    sender_id CHAR(36) NOT NULL,
    text TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_convo_time (conversation_id, created_at)
);

-- Credit Audit Trail
CREATE TABLE credit_transactions (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    amount INT NOT NULL,
    balance_after INT NOT NULL,
    reason ENUM('DAILY_BONUS', 'POST_FEE', 'ADMIN_GIFT') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## 4. API Endpoint Specification

| Method | Endpoint | Middleware | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | - | Create user, grant 30 credits. |
| `POST` | `/api/auth/login` | - | Returns JWT with user credits. |
| `GET` | `/api/listings/feed` | `auth` | Returns 10 items not swiped by user. |
| `POST` | `/api/listings` | `auth`, `checkCredits(20)` | Deduct 20 credits, save listing. |
| `POST` | `/api/swipe` | `auth` | Body: `{ listingId, direction }`. RIGHT swipe triggers auto-chat. |
| `GET` | `/api/conversations` | `auth` | Inbox list with last message preview. |
| `POST` | `/api/messages` | `auth` | Save message + emit via Socket.io. |
| `GET` | `/api/admin/users` | `auth`, `isAdmin` | List users for credit gifting. |
| `POST` | `/api/admin/users/:id/gift` | `auth`, `isAdmin` | Add credits to user. |

## 5. Feature Implementation Details

### 5.1. Daily Login Bonus Logic (Middleware)
```typescript
// checkDailyBonus.ts
export const checkDailyBonus = async (req, res, next) => {
  const userId = req.user.id;
  const today = new Date().toISOString().split('T')[0];
  const user = await db('users').where({ id: userId }).first();
  
  if (user.last_login_date?.toISOString().split('T')[0] !== today) {
    await db.transaction(async (trx) => {
      await trx('users').where({ id: userId }).increment('credits', 4).update({ last_login_date: today });
      await trx('credit_transactions').insert({
        user_id: userId, amount: 4, balance_after: user.credits + 4, reason: 'DAILY_BONUS'
      });
    });
    req.user.credits += 4; // Update JWT payload reference
  }
  next();
};
```

### 5.2. Right Swipe Auto-Inquiry (Transaction)
```typescript
// POST /api/swipe
if (direction === 'RIGHT') {
  await db.transaction(async (trx) => {
    // 1. Record swipe
    await trx('swipes').insert({ user_id: userId, listing_id: listingId, direction });
    
    // 2. Find seller
    const listing = await trx('listings').where({ id: listingId }).first();
    
    // 3. Create conversation (ignore if exists)
    const [convo] = await trx('conversations').insert({
      listing_id: listingId, buyer_id: userId, seller_id: listing.seller_id
    }).onConflict(['listing_id', 'buyer_id']).ignore().returning('id');
    
    if (convo) {
      // 4. Insert system message
      await trx('messages').insert({
        conversation_id: convo.id,
        sender_id: userId, // System message from buyer
        text: "Hi! Is this still available?"
      });
    }
  });
}
```

### 5.3. Framer Motion Swipe Component (Frontend)
```tsx
// CardStack.tsx
const Card = ({ listing, onSwipe }) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-30, 30]);
  
  const handleDragEnd = (_, info) => {
    if (info.offset.x > 100) onSwipe('RIGHT');
    else if (info.offset.x < -100) onSwipe('LEFT');
  };

  return (
    <motion.div
      style={{ x, rotate }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      className="absolute w-full h-full bg-white rounded-xl shadow-brutal"
    >
      {/* Card Content */}
    </motion.div>
  );
};
```

## 6. Development Phases & Task Checklist

### Phase 1: Environment & Economy Core (Week 1)
- [ ] Initialize Next.js + Express monorepo structure.
- [ ] Create `docker-compose.yml` with MySQL, Redis, Backend, Frontend services.
- [ ] Implement JWT Authentication (HTTP-Only cookies).
- [ ] Create database migration for `users` and `credit_transactions`.
- [ ] Implement Daily Login Middleware with Redis cooldown.
- [ ] Test: Register -> Get 30 credits. Login next day -> Get 34 credits.

### Phase 2: Discovery & Swipe Interaction (Week 2-3)
- [ ] Seed database with 50 dummy listings (Faker.js).
- [ ] Build API endpoint `GET /api/listings/feed` (exclude previously swiped items).
- [ ] Implement Framer Motion `CardStack` component.
- [ ] Implement `POST /api/swipe` with auto-conversation logic.
- [ ] Setup Socket.io server and basic room connection on conversation join.
- [ ] Test: Swipe Right -> Check inbox for auto-message.

### Phase 3: Seller Dashboard & Post Flow (Week 4)
- [ ] Build `POST /api/listings` with credit check and deduction.
- [ ] Integrate `react-dropzone` for image uploads.
- [ ] Setup `multer` with Sharp for image compression (WebP).
- [ ] Create "My Listings" grid page (`GET /api/listings?sellerId=me`).
- [ ] Implement "Mark as Sold" toggle button.
- [ ] Test: Post item costs 20 credits. Upload images saved to volume.

### Phase 4: Messaging & Real-Time Polish (Week 5)
- [ ] Build 3-Column Inbox UI (Conversation List | Chat Window | Listing Preview).
- [ ] Integrate Zustand for optimistic message updates.
- [ ] Implement Socket.io `sendMessage` and `receiveMessage` events.
- [ ] Add "Unread" badge counter (query count of `is_read=false`).
- [ ] Apply Brutalist CSS styling (high contrast, sharp shadows, monospaced fonts).
- [ ] Test: Send message from two browsers -> appears instantly.

### Phase 5: Admin Tools & Deployment (Week 6)
- [ ] Build Admin page with user search and "Gift Credits" modal.
- [ ] Build Admin listing moderation table (soft delete button).
- [ ] Configure Nginx reverse proxy on GCP VM.
- [ ] Set up `certbot` for HTTPS (Let's Encrypt).
- [ ] Write production `docker-compose.prod.yml` with volume mounts and restart policies.
- [ ] Final E2E test with Playwright: Login -> Swipe -> Chat.

## 7. Docker Compose Configuration (Development)

```yaml
# docker-compose.yml
version: '3.8'
services:
  mysql:
    image: mysql:8.0
    container_name: swipethrift-db
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: swipethrift
      MYSQL_USER: dev
      MYSQL_PASSWORD: devpass
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

  redis:
    image: redis:alpine
    container_name: swipethrift-redis
    ports:
      - "6379:6379"

  backend:
    build: ./backend
    container_name: swipethrift-api
    ports:
      - "5000:5000"
    volumes:
      - ./backend:/app
      - uploads:/app/uploads
    environment:
      NODE_ENV: development
      DB_HOST: mysql
      REDIS_HOST: redis
    depends_on:
      - mysql
      - redis

  frontend:
    build: ./frontend
    container_name: swipethrift-web
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:5000
    depends_on:
      - backend

volumes:
  mysql_data:
  uploads:
```

## 8. Production Deployment Commands (GCP VPS)

```bash
# 1. Clone repo on VPS
git clone https://github.com/yourname/swipethrift.git
cd swipethrift

# 2. Build production images
docker compose -f docker-compose.prod.yml build

# 3. Start services
docker compose -f docker-compose.prod.yml up -d

# 4. Setup Nginx (manual step)
sudo apt install nginx certbot python3-certbot-nginx
sudo certbot --nginx -d swipethrift.com -d www.swipethrift.com

# 5. Nginx config (/etc/nginx/sites-available/swipethrift)
# proxy_pass http://localhost:3000 for frontend
# proxy_pass http://localhost:5000/api for backend
# proxy_pass http://localhost:5000/socket.io for websockets
```

## 9. Security & Performance Checklist

- [ ] Use `helmet` middleware in Express.
- [ ] Use `express-rate-limit` on `/api/swipe` (100 req/min).
- [ ] Compress images to WebP (max width 1200px) using `sharp`.
- [ ] Enable MySQL query logging in development only.
- [ ] Store JWT in HTTP-Only cookie (not localStorage).
- [ ] Sanitize all user inputs with `express-validator`.

## 10. AI Agent Instruction Set

**For AI coding agents (e.g., Cursor, Copilot, Aider):**

- **Context:** You are building a full-stack marketplace application called SwipeThrift.
-Follow the AGENTS.md Strictly
- **Primary Goal:** Follow the Phase-based checklist in section 6.
- **Database:** Use the exact schema provided in section 3.
- **Middleware:** Implement the daily login logic exactly as shown in section 5.1.
- **Swiping Logic:** The auto-conversation creation on RIGHT swipe is **critical**.
- **Styling:** Use a "Brutalist" design language (border-2, shadow-[4px_4px_0px_0px]).
- **Testing:** Generate a Playwright test for the full user journey after Phase 4.

**End of Document.**
```