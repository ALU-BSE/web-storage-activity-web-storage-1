# Web Storage Learning Activity Demo

Team implementation for the classroom assignment using Node.js + Express and a browser client.

## How to run

1. Install dependencies:

```bash
npm install
```

2. Start the server:

```bash
npm start
```

3. Open `http://localhost:3000` in your browser.

## What is implemented

- Task 1 (Cookies authentication)
  - Login form with username and password.
  - `authToken` cookie is set on the server with:
    - `HttpOnly`
    - `Secure` in production (`NODE_ENV=production`)
    - 7-day expiration
  - Logout clears `authToken`.

- Task 2 (Theme with localStorage)
  - Theme toggle for light/dark mode.
  - Settings object stored with `JSON.stringify` / `JSON.parse`:
    - `{ theme, fontSize }`

- Task 3 (Session cart)
  - Cart stored in `sessionStorage`.
  - Add item + quantity and render cart dynamically.
  - Cart reset behavior matches session-only storage.

- Task 4 (Security)
  - XSS-focused sanitization demo using `encodeURIComponent`.
  - CSRF token generated server-side and validated on login.
  - Optional challenge included: encrypted email storage with CryptoJS.

- Task 5 (Reflection)
  - Comparison table and short answers are included directly in the app UI.

## Notes for submission

- Use this repo URL for GitHub Classroom submission.
- Include your completed course form as PDF in your official submission flow.
- Recommended teamwork flow:
  - feature branches per task
  - clear commit messages
  - pull request review before merge
