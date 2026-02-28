# HR.AI Frontend

React + Next.js frontend for the HR Assistance system.

## Setup

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

App runs on: http://localhost:3000
Backend expected at: http://localhost:8010

## .env.local
```
NEXT_PUBLIC_API_URL=http://localhost:8010
```

## Pages
- `/login` — Login / Register
- `/candidates` — Upload CVs, list, filter, delete
- `/jobs` — Create JD + match candidates
- `/jobs/[id]` — View match results
- `/assistant` — AI chat with all candidates

## Tech Stack
- Next.js 14 App Router
- Redux Toolkit
- Tailwind CSS
- Axios
- Lucide React icons
- Fonts: Sora + DM Sans
# Zephire
