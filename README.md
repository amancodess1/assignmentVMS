# FuelEU Maritime — Compliance Module

Minimal scaffold for the Fuel EU Maritime compliance assignment.

Structure:
- /frontend — React + TypeScript + Vite + Tailwind (hexagonal folder layout under `src/`)
- /backend — Node.js + TypeScript + Express + Prisma + PostgreSQL (hexagonal layout)

Quick start (after installing dependencies):

Frontend
```
cd frontend
npm install
npm run dev
```

Backend
```
cd backend
npm install
# ensure DATABASE_URL is set to a PostgreSQL instance
npm run migrate
npm run seed
npm run dev
```

See `AGENT_WORKFLOW.md` and `REFLECTION.md` for AI-agent usage notes.
