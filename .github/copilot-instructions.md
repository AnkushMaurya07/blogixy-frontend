# Frontend Agent Instructions

Before changing frontend code, read `agent-instructions/README.md`. This folder is Git-ignored and contains local frontend conventions; apply its guidance to frontend work and do not assume it is shared with other clones.

Use `README.md` for the app overview. Keep API usage aligned with the backend contract and use the shared API client, hooks, and types under `src/api/`.

Add or update tests for behavior changes. `npm test` and `npm run build` must both pass before considering a frontend change complete. When a change establishes or invalidates a durable frontend architecture decision, convention, constraint, or validation workflow, update `agent-instructions/README.md`; do not add routine code changes to the guide.