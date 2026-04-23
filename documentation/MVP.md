# SwipeThrift - MVP Specification

**Document Version:** 1.0  
**Status:** Ready for Development  
**Goal:** Launch a functional thrift marketplace with credit economy within 2-3 weeks.

---

## 1. MVP Goal

Validate the **Credit Economy** hypothesis:  
*Will users accept a daily login reward in exchange for limiting spammy posts and incentivizing engagement?*

The MVP must allow a single user to:
1.  Sign up and receive 30 free credits.
2.  Post a listing (costs 20 credits).
3.  Swipe on other listings.
4.  Auto-start a chat when swiping right.
5.  Earn +4 credits on their next-day login.

---

## 2. Core Features (Must-Have)

| Feature Category | MVP Implementation | Technical Complexity |
| :--- | :--- | :--- |
| **Authentication** | Email/Password signup & login. No email verification. | Low |
| **Credit System** | Start with 30 credits. +4 on next calendar day login. | Medium |
| **Swipe Discovery** | Fetch 10 listings user hasn't swiped on. Swipe left/right. | Medium |
| **Post Listing** | Title, Price, 1 Image. Deduct 20 credits. | Medium |
| **Basic Chat** | After right swipe, show a conversation with the auto-message *"Hi! Is this still available?"* | Medium |
| **My Listings** | View items I've posted. Toggle as "Sold". | Low |

---

## 3. Out of Scope (Future Iterations)

- ❌ **Real-time Typing Indicators** (Socket.io will only send messages, not "typing" events).
- ❌ **Multiple Images per Listing** (MVP supports exactly 1 image).
- ❌ **Search / Filters** (Only random feed).
- ❌ **Push Notifications** (User must refresh inbox).
- ❌ **Admin Dashboard** (Credit adjustments will be done manually in the DB).
- ❌ **Password Reset / Email Verification**.
- ❌ **User Profiles / Avatars**.

---

## 4. MVP User Stories (Acceptance Criteria)

### Epic 1: Onboarding & Economy
- **US-01:** As a new user, I want to register with a username and password so I can start using the app.
    - *AC:* On successful registration, I see my credit balance showing **30**.
- **US-02:** As a returning user, if I log in on a new calendar day, I should see my credits increase by **4**.
    - *AC:* Logging in at 11:59 PM then 12:01 AM triggers the bonus. Logging in twice on the same day does **not**.

### Epic 2: Discovery & Swiping
- **US-03:** As a buyer, I want to see a stack of items I haven't interacted with.
    - *AC:* I see the item image, title, and price.
- **US-04:** As a buyer, I want to drag cards left (pass) or right (interested).
    - *AC:* Swiping left removes the card permanently from my feed. Swiping right removes it and creates a chat.

### Epic 3: Selling
- **US-05:** As a seller, I want to list an item from my closet.
    - *AC:* If I have **≥20 credits**, I can fill out a form (Title, Price, Upload Photo) and submit. My credit balance decreases by 20 immediately.
- **US-06:** As a seller, I want to see my active listings and mark them as sold.
    - *AC:* A simple list view with a "Mark Sold" button. Sold items do not appear in the swipe feed.

### Epic 4: Communication
- **US-07:** As a buyer/seller, I want to see my list of conversations.
    - *AC:* Clicking a conversation shows the auto-generated opening message.
- **US-08:** As a user, I want to send a text reply.
    - *AC:* I type a message, press enter, and the message appears in the chat window without refreshing the page.

---

## 5. Technical Architecture (MVP Stack)

| Component | Choice | Justification for MVP Speed |
| :--- | :--- | :--- |
| **Monorepo** | Single Git repo with `frontend` and `backend` | Simple path imports. |
| **Frontend** | Next.js (App Router) | Maintain standard from AGENTS.md. |
| **Styling** | Tailwind CSS | Zero custom CSS files. |
| **Animation** | Framer Motion | Essential for swipe physics. |
| **Backend** | Node.js + Express | Maintain layered architecture from AGENTS.md. |
| **Realtime** | Socket.io | Core real-time messaging. |
| **Database** | MySQL 8 | As per SDP.md for relational integrity. |

---

## 6. MVP Database Schema (Simplified)
*Refer to SDP.md for full MySQL schema. Key tables: User, Listing, Swipe, Conversation, Message.*

---

## 7. Critical Implementation Logic
*Refer to SDP.md for Credit Economy and Swipe logic.*
