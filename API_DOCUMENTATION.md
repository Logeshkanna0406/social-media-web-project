# ConnectHub AI - REST API Documentation

Base URL: `http://localhost:5000/api`

---

## 🔑 Authentication Endpoints

### 1. Register User
`POST /auth/register`
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "Password123!",
    "fullName": "Jane Doe",
    "headline": "Full Stack Architect",
    "role": "USER"
  }
  ```
- **Response** (201 Created):
  ```json
  {
    "message": "User registered successfully",
    "user": { "id": "usr-123", "email": "user@example.com", "fullName": "Jane Doe", "role": "USER" },
    "accessToken": "ey...",
    "refreshToken": "ey..."
  }
  ```

### 2. Login User
`POST /auth/login`
- **Body**:
  ```json
  {
    "email": "demo@connecthub.ai",
    "password": "Password123!"
  }
  ```

### 3. Get Current Profile
`GET /auth/me` (Requires Header `Authorization: Bearer <token>`)

---

## 🤖 AI Endpoints

### 1. Review Resume & ATS Score
`POST /ai/resume-review`
- **Body**: `{ "resumeText": "Pasted resume content..." }`
- **Response**:
  ```json
  {
    "score": 88,
    "summary": "Strong technical profile",
    "strengths": ["Clear metrics"],
    "improvements": ["Add leadership details"],
    "suggestedKeywords": ["TypeScript", "Docker"]
  }
  ```

### 2. Generate Professional Bio
`POST /ai/generate-bio`
- **Body**: `{ "skills": ["React", "Node"], "role": "Senior Engineer" }`

### 3. AI Post Assistant
`POST /ai/generate-post`
- **Body**: `{ "topic": "AI in Web Apps", "tone": "professional" }`

---

## 📰 Posts & Feed

- `GET /posts/feed`: Fetch main feed stream.
- `POST /posts`: Create post (content, media, polls).
- `POST /posts/:postId/like`: Toggle post like.
- `POST /posts/:postId/comment`: Add comment.
- `POST /posts/poll/vote`: Cast poll vote.

---

## 💼 Jobs Portal

- `GET /jobs`: Query job listings (filters: query, remoteOnly).
- `POST /jobs`: Create job listing (Recruiter/Admin).
- `POST /jobs/apply`: Submit job application with cover letter.

---

## 💬 Realtime Messages & Channels

- `GET /messages/channel/:channelId`: Fetch community room messages.
- `POST /messages`: Send message (socket broadcast).
