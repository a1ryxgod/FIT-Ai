# FitTrack Frontend

Production-ready React PWA for the FitTrack SaaS fitness platform.

## Stack

| Tool | Purpose |
|------|---------|
| React 18 | UI framework |
| Vite 5 | Build tool |
| React Router 6 | Routing |
| Zustand | State management |
| Axios | HTTP client + JWT interceptors |
| TanStack Query | Server state + caching |
| Chart.js | Progress charts |
| Tailwind CSS | Styling |
| vite-plugin-pwa | PWA + Service Worker |
| Vitest + RTL | Unit tests |
| Cypress | E2E tests |

## Project Structure

```
src/
├── api/            ← Axios instance + API modules (auth, orgs, workouts, nutrition, progress)
├── components/
│   ├── ui/         ← Button, Card, Input, Modal, Badge, Spinner, EmptyState
│   └── layout/     ← Layout, Sidebar, TopBar, MobileNav, ProtectedRoute
├── hooks/          ← useAuth, useOrg, useWorkouts, useNutrition, useProgress
├── pages/
│   ├── Auth/       ← Login, Register
│   ├── Dashboard/  ← Summary, charts
│   ├── Workouts/   ← Programs, Session, History
│   ├── Nutrition/  ← FoodLog, TodaySummary
│   ├── Progress/   ← WeightLog, weight chart
│   └── Organizations/ ← Org selector, invite
├── store/          ← authStore, orgStore, workoutStore (Zustand + persist)
├── test/           ← Vitest setup + unit tests
└── utils/          ← helpers (formatDate, round1, macroPercent)
```

## Getting Started

### Prerequisites
- Node.js 18+
- Backend running at `http://localhost:8000`

### Install

```bash
cd frontend
npm install
```

### Development

```bash
npm run dev
```

App runs at [http://localhost:5173](http://localhost:5173) and proxies `/api` to `http://localhost:8000`.

### Build

```bash
npm run build
npm run preview
```

## Environment Variables

Create `.env.local` (optional — default proxies to `localhost:8000`):

```env
VITE_API_URL=https://your-backend.com
```

## Tests

### Unit tests (Vitest + React Testing Library)

```bash
npm test              # watch mode
npm run coverage      # with coverage report
```

### E2E tests (Cypress)

```bash
# Start dev server first
npm run dev

# Open Cypress UI
npm run cy:open

# Run headless
npm run cy:run
```

## PWA

The app is a full Progressive Web App:
- Works offline (static pages cached by Service Worker)
- Add to Home Screen supported
- Push notification handlers included
- App manifest with shortcuts

## Architecture

### Authentication Flow
1. `Login` → `POST /api/auth/login/` → stores `access` + `refresh` tokens in Zustand (persisted to localStorage)
2. Axios interceptor attaches `Authorization: Bearer <token>` to every request
3. On 401, interceptor auto-refreshes via `POST /api/auth/refresh/` (queues concurrent requests)
4. On refresh failure → logout + redirect to `/login`

### Multi-Tenant / Organization Flow
1. After login, user selects organization via `POST /api/orgs/{id}/switch/`
2. New JWT with `org_id` + `role` embedded is stored
3. All API calls are filtered server-side by the org in the JWT
4. `RequireOrg` guard redirects to `/organizations` if no org selected

### State Management
- `authStore` — JWT tokens + user (persisted)
- `orgStore` — current org + org list (persisted)
- `workoutStore` — in-memory active session tracking
- `@tanstack/react-query` — server state (programs, history, nutrition, weight)
