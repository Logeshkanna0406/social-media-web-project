# Developer Setup & Installation Guide

Follow these steps to run ConnectHub AI locally on your development workstation.

---

## 📋 Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- (Optional) PostgreSQL database instance or SQLite fallback

---

## ⚡ Quick Start Instructions

### 1. Install Dependencies
In the project root directory, run:
```bash
npm run install:all
```
This automatically installs node modules for both `./client` and `./server`.

### 2. Configure Environment Variables
Copy `.env.example` to `server/.env`:
```bash
cp .env.example server/.env
```

### 3. Generate Prisma Database Schema
```bash
cd server
npm run prisma:generate
```

### 4. Run Application Servers
Start Backend API & Socket Server (Terminal 1):
```bash
cd server
npm run dev
```
Server runs at: `http://localhost:5000`

Start Frontend Vite Dev Server (Terminal 2):
```bash
cd client
npm run dev
```
Client runs at: `http://localhost:5173`

---

## 🔑 Default Quick Demo Accounts

| Role | Email | Password |
| --- | --- | --- |
| **Demo Candidate** | `demo@connecthub.ai` | `Password123!` |
| **Platform Admin** | `admin@connecthub.ai` | `Password123!` |
