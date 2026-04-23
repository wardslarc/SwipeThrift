# AI Agent Guidelines

This document outlines mandatory standards, workflows, and rules for all AI coding agents assisting in this repository.  
**Treat this as your system prompt – every instruction is binding.**

---

## 📑 Table of Contents
1.  [Purpose](#1-purpose)
2.  [Project Stack](#2-project-stack)
3.  [Architecture](#3-architecture)
4.  [Repository Layout](#4-repository-layout)
5.  [Commit Standards (MANDATORY)](#5-commit-standards-mandatory)
6.  [Mandatory Workflow](#6-mandatory-workflow)
7.  [Dependency Security Policy](#7-dependency-security-policy)
8.  [Clean Code Standards (MANDATORY)](#8-clean-code-standards-mandatory)
9.  [TypeScript Rules](#9-typescript-rules)
10. [Backend Rules](#10-backend-rules)
11. [Frontend Rules](#11-frontend-rules)
12. [Security Rules (CRITICAL)](#12-security-rules-critical)
13. [Testing Rules](#13-testing-rules)
14. [Pre‑Commit AI Self‑Review](#14-pre‑commit-ai‑self‑review)
15. [Logging Rules](#15-logging-rules)
16. [Definition of Done (STRICT)](#16-definition-of-done-strict)
17. [AI Behavior & Tool Usage](#17-ai-behavior--tool-usage)
18. [HITL Protocol (When to Stop)](#18-hitl-protocol-when-to-stop)
19. [Golden Rule](#19-golden-rule)

---

## 1. Purpose
This repository uses AI coding agents to assist in building and maintaining the application.

Agents **must** produce:
- Production‑ready code
- Secure implementations
- Maintainable architecture
- Minimal, reviewable changes

> ❗ **CRITICAL:** This is **NOT** a prototyping environment — treat all code as production‑grade.

---

## 2. Project Stack
- **Frontend:** Next.js + TypeScript
- **Backend:** Node.js + TypeScript

---

## 3. Architecture
### Principles
- **Backend:** Follow a layered architecture (e.g., `routes` → `controllers` → `services` → `models`).
- **Frontend:** Separate concerns (e.g., `pages` → `components` → `hooks`/`services`).

### Rules
- Do **NOT** break layering.
- Do **NOT** mix responsibilities.
- Do **NOT** introduce new architectural patterns without explicit instruction.

---

## 4. Repository Layout
Adhere to the existing folder structure. Common patterns:

```text
backend/
  src/
    controllers/
    middleware/
    models/
    routes/
    services/
    utils/
    __tests__/

frontend/
  src/
    app/
    components/
    hooks/
    services/
    types/
    __tests__/
```

---

## 5. 🔁 Commit Standards (MANDATORY)
### Format
`<type>(<scope>): <description>`

### Types
`feat` | `fix` | `refactor` | `perf` | `test` | `docs` | `style` | `chore` | `build` | `ci` | `security`

### Allowed Scopes (examples)
`auth` | `user` | `api` | `ui` | `middleware` | `security` | `deps` | `docs`

### Rules
- One commit = one logical task.
- No vague messages.
- No multi‑feature commits.
- Always use present tense.

---

## 6. 🔁 Mandatory Workflow
After **EVERY** task:

1. **Verify** – Run the project locally and confirm that changes work as expected (e.g., `npm run dev`, `npm test`).
2. **Lint & Format** – Ensure code passes linting and formatting checks (`npm run lint`, `npm run format`).
3. **Commit** – Create a single commit with a properly formatted message.

> ❗ **NEVER** skip verification.  
> ❗ **NEVER** batch multiple logical tasks into one commit.

---

## 7. 🚨 Dependency Security Policy
### ❌ NEVER
- Blindly update dependencies.
- Install "latest" versions without review.
- Use newly released packages (<30 days old).
- Introduce unnecessary dependencies.

### ✅ ONLY update if:
- Critical bug fix
- Security vulnerability (CVE)
- Explicitly requested by user

### Rules
- Prefer stable, pinned versions (avoid `^` or `latest`).
- Verify compatibility with existing stack.
- If a package must be added, explain why in the commit body.

---

## 8. 🔥 Clean Code Standards (MANDATORY)
### Principles
- Readability > Cleverness
- Small functions (ideal: 5–20 lines)
- Explicit naming
- Single responsibility
- Early returns over deep nesting

### Naming Examples
```typescript
// ✅ GOOD
const userAssignments = getUserAssignments();

// ❌ BAD
const d = getData();
```

### ❌ Avoid Dead Code
- Remove unused variables, imports, and commented‑out blocks.
- If code is intentionally commented for future reference, add a `// TODO:` with explanation.

---

## 9. 🔷 TypeScript Rules
### ❌ Strict Ban on `any`
- `any` is forbidden unless accompanied by an explicit, commented justification.
- Prefer `unknown` for values of uncertain shape.

### ✅ Required Pattern for Unknown Inputs
```typescript
try {
  const data = await fetchSomething();
} catch (error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  logger.error(`Operation failed: ${message}`);
}
```

### ✅ Strong Types
- All DTOs, API responses, and function signatures must be explicitly typed.
- Use `interface` over `type` for object shapes unless unions are required.

### ❌ No Unsafe Casting
- Do not use `as` unless you have validated the shape first (e.g., using a validation library or type guard).

---

## 10. 🔧 Backend Rules (Node.js)
### Controllers
- **Only** handle request/response lifecycle.
- Call services; never contain business logic.

### Services
- Contain all business logic.
- Reusable across controllers and other services.

### Middleware
- Authentication
- Authorization
- Request validation
- Security headers

### ❌ NEVER:
- Access the data layer directly from a controller or route.
- Skip permission checks even for "internal" endpoints.

---

## 11. 🎨 Frontend Rules (Next.js)
### Components
- Small, reusable, and focused.
- Break large components into sub‑components.

### Logic Separation
- Complex state logic or side effects → Custom Hooks (`hooks/`).
- Data fetching and transformation → Services (`services/`).

### API Calls
- Always go through the service layer.
- Respect the existing authentication flow.

### ❌ NEVER:
- Wrap JSX return with `try/catch`. Use React Error Boundaries or `useState` error states instead.

---

## 12. 🔐 Security Rules (CRITICAL)
Agents **MUST** actively enforce the following during every code change.

### 🚨 Mandatory Security Audit Checklist
Before finishing a task, verify **all** of the following:

| Vulnerability | Check |
| :--- | :--- |
| **IDOR** | Does the endpoint verify that the authenticated user is authorised to access the requested resource? |
| **Privilege Escalation** | Can a lower‑privileged user modify roles or access admin‑only data? |
| **Missing Permissions** | Is proper authorization middleware applied to every sensitive route? |
| **Data Exposure** | Does the response ever include passwords, tokens, or internal secrets? |
| **Injection** | Are all user inputs validated and (where appropriate) sanitised? |

### Authentication & Authorization
- **Always** use authentication middleware.
- **Always** enforce permission checks on protected routes.

---

## 13. 🧪 Testing Rules
Agents should **add or update** tests for:
- New authentication flows
- Permission boundaries (both allowed and denied cases)
- Input validation edge cases
- Critical business logic

> 📌 Tests are expected but not required for trivial UI text changes. Use judgement.

---

## 14. ✅ Pre‑Commit AI Self‑Review
Before staging any changes, the agent **MUST** perform this review internally.

### Security
- [ ] Auth enforced on new routes?
- [ ] Permissions correct?
- [ ] No sensitive data in responses or logs?

### Performance
- [ ] Any unnecessary loops?
- [ ] Redundant API calls (e.g., inside `useEffect` without deps)?

### Maintainability
- [ ] Functions under ~30 lines?
- [ ] Naming self‑documenting?
- [ ] No duplicated logic?

### Code Smells (Auto‑Fix)
If any of the following are detected, **fix them immediately**:
- Duplicated logic (extract to a shared util/service).
- Function > 50 lines (split).
- Unclear variable/function names (rename).
- Missing input validation.
- Dead / commented‑out code.

---

## 15. 🪵 Logging Rules
- **Include context:** Always log `userId`, `requestId`, or relevant identifier.
- **Never log:** Passwords, tokens, or PII (emails only if necessary and hashed/redacted).
- Use structured logging (`logger.info({ userId, action })` over string concatenation).

---

## 16. ✅ Definition of Done (STRICT)
A task is **complete** only when all boxes are checked:

- [ ] Clean, readable code
- [ ] Architecture layers respected
- [ ] Security audit passed (Section 12)
- [ ] Local verification passed (run and test)
- [ ] Committed with correct format (Section 5)
- [ ] No dead code or `any` (without justification)
- [ ] Types are safe and complete
- [ ] Self‑review performed (Section 14)

---

## 17. 🧠 AI Behavior & Tool Usage
### ⚠️ Project Awareness
- This is a Next.js + Node.js monorepo (or separate projects). Verify the structure before editing.
- **Testing:** Use appropriate commands (e.g., `npm test`, `npm run dev`).
- **Pathing:** Frontend changes go in `frontend/`; backend in `backend/`. Never mix them.

### 🔧 Efficient Tool Use
- **Read Before Edit:** Use `read_file` to understand existing patterns. Do not assume.
- **Minimal Diffs:** Use targeted `replace_in_file` operations. Do **not** rewrite entire files unless explicitly asked.
- **Verification Loop:** After modifying a critical file, test the change locally.

### ❌ Forbidden Actions
- Do **not** edit `package.json` to add dependencies without user approval (see Section 7).
- Do **not** guess file paths; use `search_file` or `list_files` if unsure.

---

## 18. 🛑 HITL Protocol (When to Stop)
If you encounter any of the following situations, **STOP** and ask the user for clarification.  
**Do not invent a solution.**

1. **Ambiguous Permissions:** You need a permission like `course:edit` but the codebase uses `course:write` or `course:update`.
2. **Missing Environment Variable:** A required variable (e.g., `JWT_SECRET`) is not defined in `.env.example` or the environment.
3. **Dependency Conflict:** A required update violates the stability rule (Section 7).
4. **Architectural Decision:** You believe a new service or major refactor is required.

---

## 19. 🏁 Golden Rule
> **Write code as if another developer will maintain it tomorrow – and that developer knows where you live.**
```
