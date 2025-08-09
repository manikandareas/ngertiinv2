# ngertiinv2 Overview

## Project Structure
```text
├── app/                         # Front‑end app source
│   ├── components/              # Reusable UI primitives
│   ├── features/                # Feature-specific modules (home, landing-page, etc.)
│   ├── lib/                     # Shared utilities
│   ├── routes/                  # Route components
│   ├── routes.ts                # React Router configuration
│   └── root.tsx                 # Application root/layout & providers
├── convex/                      # Convex serverless backend (actions, queries, schema)
├── public/                      # Static assets
├── package.json                 # Node/Bun dependencies & scripts
├── vite.config.ts               # Vite bundler config with React Router & Tailwind
└── react-router.config.ts       # SSR settings for React Router
```

## Technology Used

### Frontend
- [React 19](https://react.dev/) + [React Router v7](https://reactrouter.com/) (SSR enabled)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/) bundler with TailwindCSS plugin
- [Tailwind CSS](https://tailwindcss.com/) for styling
- UI helpers: Radix UI components, Lucide & Tabler icons, `class-variance-authority`
- State/Data: [TanStack React Query](https://tanstack.com/query), `nuqs` for URL-state, `react-hook-form`, `zod`
- Auth & notifications: [Clerk](https://clerk.com/), `sonner` toaster

### Backend
- [Convex](https://convex.dev/) serverless functions and database
- `@convex-dev` utilities for rate limiting, workflows, and React Query integration

### Tooling
- Bun or npm for package management
- Dockerfile for containerized deployments

## Flow: Creating a New Feature
1. **Create Feature Module**
   - Add a folder under `app/features/<feature-name>` with components and utilities.

2. **Define Route**
   - Create route component(s) in `app/routes`.
   - Register the route in `app/routes.ts` using `layout`, `route`, or `index`.

3. **Implement Backend (if needed)**
   - Add Convex functions in `convex/<feature-name>` (`queries.ts`, `mutations.ts`, `actions.ts`, `schema.ts`, etc.).
   - Use `npx convex dev`/CLI as needed to push or test functions.

4. **Compose UI**
   - Reuse primitives from `app/components/ui` or build new ones.

5. **Run Locally**
   - Start development server via `bun dev` (SSR + HMR enabled).
   - Access the app at `http://localhost:5173` and iterate.

6. **Build & Deploy**
   - `bun run build` for production output.
   - Optionally containerize via the provided `Dockerfile`.