# FIT AI

> Full-stack fitness tracking platform with an AI-powered coach, multi-tenant gym management, and real-time progress analytics.

---

## Overview

FIT AI is a production-ready web application for tracking workouts, nutrition, and body composition. It supports individual users and gym organizations with role-based access, and integrates an OpenAI-powered fitness assistant that gives personalized advice based on your actual training data.

---

## Features

### Workouts
- Log sessions with sets, reps, and weight per exercise
- Create custom workout programs
- View full session history with set counts
- Personal Records (PR) auto-calculated per exercise — best weight, reps, and estimated 1RM (Epley formula)

### Nutrition
- Log meals by type: Breakfast, Lunch, Dinner, Snacks
- Daily macro breakdown: calories, protein, carbs, fats
- Progress bars against personalized nutrition goals
- Full food log history with search

### Progress
- Weight tracking with historical chart
- Min/max/change stats
- Personal Records leaderboard with muscle group color coding and trophy for #1

### Dashboard
- Daily calorie progress against your personal goal
- Macro split doughnut chart
- Weight trend line chart (last 14 entries)
- Weekly workout counter (goal: 5/week)
- Latest PR card
- Recent sessions list

### Nutrition Goals & TDEE
- Set custom calorie / protein / carbs / fat targets in your profile
- Auto-calculate button uses Mifflin-St Jeor BMR formula:
  ```
  BMR  = 10 × weight(kg) + 6.25 × height(cm) − 5 × age + 5
  TDEE = BMR × activity multiplier
  ```
- Protein: 2 g/kg bodyweight
- Fat: 25% of TDEE
- Carbs: remaining calories

### AI Fitness Assistant
- Context-aware chat — knows your weight, today's macros, and weekly workout frequency
- Workout analysis — reviews last 4 weeks of training volume, frequency, and muscle balance
- Powered by GPT-4o-mini

### Organizations (Multi-tenant)
- Create or join a gym/organization
- Roles: Owner, Admin, Trainer, Member
- Owners and Admins see an extended dashboard with gym-wide stats
- All data is scoped to the organization

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, TailwindCSS |
| State | Zustand, TanStack React Query |
| Charts | Chart.js + react-chartjs-2 |
| Backend | Django 4, Django REST Framework |
| Auth | JWT (SimpleJWT) |
| Database | PostgreSQL |
| AI | OpenAI API (GPT-4o-mini) |
| DevOps | Docker, Docker Compose |
| PWA | vite-plugin-pwa + Workbox |
| Testing | Pytest (backend), Vitest + Cypress (frontend) |

---

## Project Structure

```
FIT Ai/
├── backend/
│   ├── apps/
│   │   ├── ai/           # AI chat + workout analysis (OpenAI)
│   │   ├── core/         # Base models, permissions, pagination, middleware
│   │   ├── nutrition/    # Food logs, macro tracking
│   │   ├── organizations/# Multi-tenant orgs + membership roles
│   │   ├── progress/     # Weight logs
│   │   ├── users/        # Custom User model, Profile, nutrition goals
│   │   └── workouts/     # Programs, sessions, sets, exercises, PRs
│   ├── config/
│   │   └── settings/     # development / production
│   ├── tests/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── manage.py
│
└── frontend/
    └── src/
        ├── api/          # Axios API clients
        ├── components/   # UI components + layout
        ├── hooks/        # React Query hooks
        ├── pages/        # Dashboard, Workouts, Nutrition, Progress, Profile, AI
        └── store/        # Zustand stores (auth, org, workout)
```

---

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL (or Docker)

### Backend

```bash
cd backend

# Create and activate virtualenv
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env — set DB credentials, SECRET_KEY, OPENAI_API_KEY

# Run migrations
python manage.py migrate

# (Optional) load exercise seed data
python manage.py loaddata exercises

# Start dev server
python manage.py runserver
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173` and proxies `/api` to `http://localhost:8000`.

### Docker (full stack)

```bash
cd backend
docker-compose up --build
```

---

## Environment Variables

Copy `backend/.env.example` to `backend/.env` and fill in:

| Variable | Description |
|---|---|
| `SECRET_KEY` | Django secret key |
| `DEBUG` | `True` for development |
| `DB_NAME / DB_USER / DB_PASSWORD / DB_HOST / DB_PORT` | PostgreSQL connection |
| `OPENAI_API_KEY` | Your OpenAI API key |
| `OPENAI_MODEL` | Model to use (default: `gpt-4o-mini`) |
| `CORS_ALLOWED_ORIGINS` | Frontend origins allowed by CORS |

---

## API Overview

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register/` | Register user |
| POST | `/api/auth/login/` | Obtain JWT tokens |
| GET/PATCH | `/api/auth/profile/` | Get or update profile + nutrition goals |
| GET/POST | `/api/workouts/programs/` | Workout programs |
| POST | `/api/workouts/start/` | Start a workout session |
| POST | `/api/workouts/add-set/` | Log a set |
| GET | `/api/workouts/history/` | Session history |
| GET | `/api/workouts/prs/` | Personal records + estimated 1RM |
| GET | `/api/exercises/` | Exercise list |
| GET | `/api/nutrition/today/` | Today's macro totals + food logs |
| POST | `/api/nutrition/log/` | Log food |
| GET | `/api/progress/weight/` | Weight log history |
| POST | `/api/progress/weight/` | Log body weight |
| POST | `/api/ai/chat/` | AI fitness chat |
| POST | `/api/ai/analyze/` | AI workout analysis |
| GET | `/api/ai/history/` | Chat message history |
| GET/POST | `/api/organizations/` | List or create organizations |
| POST | `/api/organizations/{slug}/join/` | Join an organization |

---

## Testing

```bash
# Backend
cd backend
pytest

# Frontend unit tests
cd frontend
npm test

# Frontend E2E
npm run cy:open
```

---

## License

MIT
