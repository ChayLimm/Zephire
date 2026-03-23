<div align="center">

# SokHR — Smart HR & Candidate Management

**AI-powered HR assistant for intelligent candidate screening, job matching, and recruitment automation.**

Built with **Next.js 14** · **Redux Toolkit** · **TypeScript** · **Tailwind CSS**

</div>

---

## Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Pages & Routes](#-pages--routes)
- [State Management](#-state-management)
- [API Layer](#-api-layer)
- [Scripts](#-scripts)

---

## Overview

**Zephire** is a modern, full-stack HR management frontend that leverages AI to streamline the recruitment pipeline. It allows HR teams to upload and manage candidate CVs, create job descriptions, automatically match candidates to jobs using AI, communicate via an AI chat assistant, and send bulk emails — all from a single, beautiful dashboard.

The frontend communicates with a backend API (expected at `http://localhost:8010` by default) that handles authentication, candidate processing, CV parsing, AI-powered matching, and email delivery.

---

## Features

| Feature | Description |
|---|---|
| **Authentication** | JWT-based login & registration with automatic token refresh and auth guards |
| **Candidate Management** | Upload CVs (PDF), view parsed profiles, edit, approve/reject, and delete candidates |
| **Job Descriptions** | Create job descriptions with required skills, experience, and field criteria |
| **AI Candidate Matching** | Automatically match candidates to job descriptions with scored results |
| **AI Chat Assistant** | Context-aware chat with AI about candidates and job matches |
| **Bulk Email** | Send interview invitations, rejection notices, and custom emails to candidates |
| **Public Apply Form** | Public-facing application form for candidates to submit their own CVs |
| **Modern UI** | Clean light theme with glassmorphism, smooth animations, and responsive layout |

---

## Tech Stack

| Technology | Purpose |
|---|---|
| [Next.js 14](https://nextjs.org/) | React framework with App Router |
| [TypeScript](https://www.typescriptlang.org/) | Type-safe JavaScript |
| [Redux Toolkit](https://redux-toolkit.js.org/) | Global state management |
| [Tailwind CSS 3](https://tailwindcss.com/) | Utility-first CSS framework |
| [Axios](https://axios-http.com/) | HTTP client with interceptors |
| [Lucide React](https://lucide.dev/) | Icon library |
| [js-cookie](https://github.com/js-cookie/js-cookie) | Cookie management for auth |
| [Google Fonts](https://fonts.google.com/) | Sora (headings) + DM Sans (body) |

---

## Project Structure

```
hr-frontend/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── layout.tsx          # Root layout with providers & auth guard
│   │   ├── page.tsx            # Home page (redirects)
│   │   ├── globals.css         # Global styles & design tokens
│   │   ├── login/              # Login & registration page
│   │   ├── candidates/         # Candidate management dashboard
│   │   ├── jobs/               # Job descriptions & matching
│   │   ├── assistant/          # AI chat assistant
│   │   ├── emails/             # Email management
│   │   └── apply/              # Public candidate application form
│   │
│   ├── components/             # Reusable UI components
│   │   ├── AuthGuard.tsx       # Route protection wrapper
│   │   ├── Sidebar.tsx         # Navigation sidebar
│   │   ├── ui/                 # Generic UI components
│   │   │   ├── Avatar.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Skeleton.tsx
│   │   │   └── ToastContainer.tsx
│   │   ├── candidates/         # Candidate-specific components
│   │   └── jobs/               # Job-specific components
│   │       ├── JobModal.tsx
│   │       ├── EmailFormPanel.tsx
│   │       └── chat/           # In-context chat components
│   │
│   ├── store/                  # Redux store configuration
│   │   ├── index.ts            # Store setup
│   │   ├── hooks.ts            # Typed useAppDispatch & useAppSelector
│   │   ├── StoreProvider.tsx   # Redux Provider wrapper
│   │   └── slices/             # Feature slices
│   │       ├── authSlice.ts
│   │       ├── candidatesSlice.ts
│   │       ├── chatSlice.ts
│   │       ├── emailSlice.ts
│   │       ├── jobsSlice.ts
│   │       └── uiSlice.ts
│   │
│   ├── lib/
│   │   └── api.ts              # Axios instance & API functions
│   │
│   └── types/
│       └── index.ts            # Shared TypeScript interfaces
│
├── tailwind.config.ts          # Tailwind theme & animations
├── next.config.js              # Next.js configuration
├── tsconfig.json               # TypeScript configuration
├── postcss.config.js           # PostCSS configuration
└── package.json
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** or **yarn**
- Backend API server running (default: `http://localhost:8010`)

### Installation

```bash
# Clone the repository
git clone https://github.com/ChayLimm/Zephire.git
cd hr-frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your API URL (see below)

# Start the development server
npm run dev
```

The app will be available at **http://localhost:3000**.

---

## Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_API_URL=http://localhost:8010
```

| Variable | Description | Default |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:8010` |

---

## Pages & Routes

| Route | Access | Description |
|---|---|---|
| `/login` | Public | Login and registration page |
| `/candidates` | Protected | Upload CVs, view/edit/approve/reject/delete candidates |
| `/jobs` | Protected | Create job descriptions and trigger AI matching |
| `/jobs/[id]` | Protected | View match results for a specific job |
| `/assistant` | Protected | AI chat assistant for candidate insights |
| `/emails` | Protected | Email management and bulk sending |
| `/apply` | Public | Public-facing candidate application form |

> Protected routes require authentication. The `AuthGuard` component redirects unauthenticated users to `/login`.

---

## State Management

The app uses **Redux Toolkit** with the following slices:

| Slice | Responsibility |
|---|---|
| `authSlice` | User authentication, login/register, token management |
| `candidatesSlice` | Candidate CRUD operations, upload, approve/reject |
| `jobsSlice` | Job description management and AI matching |
| `chatSlice` | AI chat messages, history, and context handling |
| `emailSlice` | Bulk email sending and email status tracking |
| `uiSlice` | UI state (toasts, modals, loading indicators) |

Typed hooks (`useAppDispatch`, `useAppSelector`) are provided in `src/store/hooks.ts`.

---

## API Layer

All API calls are centralized in `src/lib/api.ts` using an **Axios** instance with:

- **Base URL** configured via `NEXT_PUBLIC_API_URL`
- **Request interceptor** — automatically attaches JWT `Bearer` token from `localStorage`
- **Response interceptor** — handles 401 errors with automatic retry and redirect to `/login`

### API Modules

| Module | Endpoints |
|---|---|
| `authApi` | `POST /api/auth/login`, `POST /api/auth/register` |
| `candidatesApi` | CRUD on `/api/candidates`, upload, approve/reject, public apply |
| `jobsApi` | CRUD on `/api/jd`, `POST /api/jd/match` |
| `chatApi` | `POST /api/chat`, history retrieval, context-specific chats |
| `emailApi` | `POST /api/email/send-bulk`, `GET /api/email`, status updates |

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server on `localhost:3000` |
| `npm run build` | Build for production |
| `npm run start` | Start production server |

---

<div align="center">

**Made with ❤️ for smarter recruitment**

</div>
