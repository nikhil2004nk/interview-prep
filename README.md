# 🚀 Interview Prep System

A premium, full-stack prep tracking application designed to help developers organize notes, practice coding/behavioral questions, set study goals, and retain knowledge using a customized **Spaced Repetition (SuperMemo-2 SM2)** flashcard engine.

---

## 🛠 Tech Stack

### Frontend
- **Framework:** React (Vite SPA)
- **Styling:** Tailwind CSS (v4) with custom glassmorphic accents
- **Icons:** Lucide React
- **Forms:** React Hook Form + Zod validation
- **Routing:** React Router DOM (with Auth & Guest route guards)

### Backend
- **Framework:** NestJS
- **ORM:** TypeORM
- **Database:** PostgreSQL
- **Authentication:** Cookie-based JWT Authentication (Secure, HttpOnly keys)
- **Validation:** Class Validator + Class Transformer

---

## 🌟 Key Features

### 1. Notes Workspace
- Complete markdown-ready notes editor.
- **Dynamic UX Indicators:** Live indicators showing unsaved changes or active edits.
- **Topic Assignment:** Easily organize notes under specific topics, with quick inline "+ New Topic" prompts.
- **Visual Badging:** Status indicator banners to prevent navigating away with unsaved draft changes.

### 2. Practice Center
- Dedicated bank for coding challenges, system design prompts, and behavioral questions.
- **Difficulty Settings:** EASY, MEDIUM, and HARD filters.
- **Submission History:** Log and view historical answers/practices.
- **Revision Hook:** Quick button to add questions directly to your daily spaced repetition queue.

### 3. Topics & Tags Management
- **Tag Filtering:** Multiple filter parameters to refine search results.
- **Common Dropdown Component:** Reusable, smart-positioning glassmorphic selector dropdowns replacing native select controls with custom arrows, scrolling viewports, and click-outside dismissal.

### 4. Study Goals & Progress Tracker
- Target goals tracker (e.g. "Prepare NestJS Microservices by August 20th").
- Circular progress indicators showing completion rates (`X / Y goals completed`).
- Multi-topic linkage to map targets to relevant domain areas.

### 5. Spaced Repetition Deck (SM2 Engine)
- Daily review queue loaded based on due dates.
- Interactive Flashcard player displaying "Reveal" card mechanics.
- **SuperMemo-2 Ratings (0-5):**
  - `0` - Blackout / Forgot
  - `1` - Hard / Incorrect
  - `2` - Hesitant / Incorrect but recognized
  - `3` - Correct but difficult
  - `4` - Good recall
  - `5` - Perfect / Immediate recall
- Submitting reviews recalculates intervals and ease factors dynamically.

---

## 📂 Project Structure

```
interview-prep/
├── backend/                  # NestJS API application
│   ├── src/
│   │   ├── auth/             # Auth controllers, guards & JWT strategy
│   │   ├── users/            # User account schemas
│   │   ├── notes/            # Notes CRUD & entities
│   │   ├── questions/        # Question banks
│   │   ├── answers/          # Answer history logs
│   │   ├── topics/           # Topics cataloging
│   │   ├── tags/             # Tags schemas
│   │   ├── goals/            # Study goal targets
│   │   └── revision/         # Spaced Repetition SM2 controller/service
│   └── package.json
│
└── frontend/                 # React SPA application
    ├── src/
    │   ├── app/              # Routes, providers & root App component
    │   ├── components/ui/    # Custom components (e.g., custom Dropdown)
    │   ├── features/         # Feature folders (auth, notes, questions, goals, revision)
    │   │   └── [feature]/
    │   │       ├── api/      # Client request modules
    │   │       └── pages/    # Screen views
    │   └── main.tsx
    └── package.json
```

---

## 🚀 Getting Started

### 1. Prerequisite Configuration
Ensure you have PostgreSQL running. Set up your environment variables by checking the local configuration requirements:

Create `/backend/.env` file:
```env
PORT=3000
DATABASE_URL=postgresql://<username>:<password>@<host>:<port>/<dbname>
JWT_SECRET=your_jwt_signing_key_here
```

### 2. Running Backend (NestJS)
```bash
cd backend
npm install
npm run start:dev
```
The server will run on `http://localhost:3000`.

### 3. Running Frontend (Vite)
```bash
cd frontend
npm install
npm run dev
```
The workspace app will run on `http://localhost:5173`.

---

## 📡 API Reference Summary

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| **POST** | `/auth/register` | Register new user profile | No |
| **POST** | `/auth/login` | Login user (returns HTTPOnly cookie) | No |
| **POST** | `/auth/logout` | Logout active user | Yes |
| **GET** | `/auth/me` | Fetch active logged-in profile | Yes |
| **GET** | `/notes` | List all user notes | Yes |
| **POST** | `/notes` | Create a note draft | Yes |
| **PUT** | `/notes/:id` | Update an existing note | Yes |
| **DELETE** | `/notes/:id` | Delete a note | Yes |
| **GET** | `/questions` | Fetch question list | Yes |
| **POST** | `/questions` | Add new question | Yes |
| **POST** | `/questions/:id/answers` | Submit practice answer log | Yes |
| **GET** | `/goals` | List study goal tracking list | Yes |
| **POST** | `/goals` | Set new target study goal | Yes |
| **PATCH** | `/goals/:id/toggle` | Toggle goal completion state | Yes |
| **GET** | `/revision/due` | Fetch flashcards due for revision today | Yes |
| **POST** | `/revision` | Register item to spaced repetition schedule | Yes |
| **POST** | `/revision/:id/review` | Log recall rating (0-5) and reschedule | Yes |
