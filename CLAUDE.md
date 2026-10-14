# CLAUDE.md - Backend Development & Verification Guidelines

## Project Overview
"E-Tongue: Intelligent Dravya Identification & Quality Workstation".
Hardware potentiostat sensing 6-channel cross-reactive electrochemical potentials, classified via Random Forest ML and an autonomous LLM agent (Gemini / Grok).

## Commands
- Run backend tests: `npm test`
- Type-check TypeScript: `npx tsc --noEmit`
- Run nightly batch job: `npm run job:nightly -- 2026-10-13`
- Start dev server: `npm run server` or `npm run dev:all`

## Code & Architecture Conventions
- **TypeScript**: Strict mode enabled, no `any` unless explicitly typed and defended.
- **Zod Validation**: All controllers must parse requests with Zod schemas (`req.body`, `req.query`, `req.params`).
- **Security**:
  - LLM has zero direct database write permissions.
  - LLM receives only verified structural metadata; the server injects real database rows for charts.
  - `Sample.notes` is never passed into LLM prompt contexts to prevent prompt injection.
  - Passwords hashed with bcrypt; JWT issued with `{ sub: user._id, role: user.role }`.
- **Database**:
  - MongoDB via Mongoose. All models must preserve existing fields: `readings.S1`..`S6`, `radarProfile`, `sha256`, `batchNumber`.
- **Agent Chat**:
  - `POST /api/v1/agent/chat` streams SSE: `tool_start`, `tool_end`, `final`, `error`.
