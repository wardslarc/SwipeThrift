# GEMINI.md - SwipeThrift Project Instructions

## 🎯 Project Overview
**SwipeThrift** is a monolithic, dockerized marketplace application featuring a Tinder-style swipe UI and a Credit Economy.

## 🛠 Tech Stack
- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion.
- **Backend:** Node.js, Express, TypeScript.
- **Database:** MySQL 8 (Relational integrity).
- **Cache:** Redis (Daily login cooldown).
- **DevOps:** Docker Compose (Monolithic orchestration).

## 📜 Core Mandates (Strict Adherence to AGENTS.md)
1. **Repository Layout:**
   - `frontend/src/`: Next.js application.
   - `backend/src/`: Express API (Layered: routes -> controllers -> services -> models).
   - `documentation/`: Project specifications and guidelines.
2. **Coding Standards:**
   - Strict TypeScript: No `any` without justification.
   - Clean Code: Small functions, explicit naming, early returns.
   - Security: Mandatory IDOR and permission checks on all backend routes.
3. **Workflow:**
   - Research -> Strategy -> Execution (Plan -> Act -> Validate).
   - Verify every change locally (linting, types, functionality).
   - after each task stage all the changes to a commit follow the proper commit standards in the AGENTS.md 

## 🚀 Development Phases (MVP Focused)

### Phase 1: Environment & Auth Setup (Current)
- [x] Restructure directory into `frontend/`, `backend/`, and `documentation/`.
- [x] Initialize Backend with TypeScript and Express.
- [x] Create `docker-compose.yml` and service Dockerfiles.
- [x] **Epic 1 (Onboarding):** Implement JWT Auth & Register (30 credits bonus).
- [ ] **Epic 1 (Economy):** Daily login bonus logic (+4 credits).

### Phase 2: Discovery & Swiping
- [ ] **Epic 2 (Discovery):** `GET /api/listings/feed` (exclude swiped items).
- [ ] **Epic 2 (Swiping):** Framer Motion `CardStack` and `POST /api/swipe`.
- [ ] **Epic 4 (Auto-Chat):** Right swipe auto-conversation creation.

### Phase 3: Selling & Management
- [ ] **Epic 3 (Selling):** `POST /api/listings` (20 credits deduction).
- [ ] **Epic 3 (Management):** "My Listings" page & "Mark as Sold" toggle.

### Phase 4: Messaging & Polish
- [ ] **Epic 4 (Messaging):** Inbox UI and Socket.io messaging.
- [ ] Brutalist CSS styling (border-2, shadow-[4px_4px_0px_0px]).
- [ ] Final E2E Verification.

## 📝 Ongoing Notes
- Ensure `frontend/` and `backend/` remain strictly decoupled.
- Refer to `documentation/MVP.md` for specific Acceptance Criteria per story.
- Use `SDP.md` for database schema and core logic details.
