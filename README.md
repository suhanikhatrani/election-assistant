# Election Process Assistant

![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![React](https://img.shields.io/badge/React-18-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-latest-green)
![License](https://img.shields.io/badge/license-MIT-blue)

> An interactive civic education platform helping users understand the election process through timelines, step-by-step guides, glossary, and quizzes. Built with Node.js, React, and MongoDB.

## Live Demo
- 🌐 Frontend: [![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?logo=vercel)](https://your-frontend.vercel.app)
- 🔌 Backend API: [![Render](https://img.shields.io/badge/Render-Deployed-purple?logo=render)](https://your-backend.onrender.com/api)

## Default Admin Account (after seeding)
| Field | Value |
|-------|-------|
| Email | `admin@election.com` |
| Password | `Admin1234!` |

> ⚠️ Change this immediately after first login in production.

## Features
- Interactive election timeline (8 phases, expandable accordion)
- Step-by-step guided walkthrough with progress tracking
- Searchable glossary with 12 civic terms
- 10-question quiz with per-user score tracking
- JWT auth with refresh tokens and httpOnly cookies
- User progress dashboard (`/dashboard`)
- Admin CRUD dashboard for all content types
- Image uploads via Cloudinary with automatic cleanup
- Analytics dashboard (Line, Bar, Pie charts via Chart.js)
- Rate limiting, Helmet security headers, input validation
- Paginated API endpoints
- CI/CD pipelines via GitHub Actions
- Automatic token refresh with Axios interceptors
- MongoDB compound indexes for performance

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Axios, Chart.js |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Auth | JWT, bcryptjs, refresh tokens |
| Storage | Cloudinary |
| Security | Helmet, CORS, rate-limiting, express-validator |

## Project Structure
```text
.github/
└── workflows/
    └── ci.yml

election-backend/
├── config/
├── controllers/
├── data/
│   └── seed.js
├── middleware/
├── models/
├── routes/
├── .env.example        ← Copy to .env and fill in values
├── .eslintrc.cjs
├── render.yaml
└── server.js

election-frontend/
├── src/
│   ├── components/
│   │   ├── admin/
│   │   └── public/
│   │       └── AuthModal.jsx
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── Home.jsx
│   │   └── Admin.jsx
│   ├── services/
│   │   └── api.js
│   ├── App.jsx
│   └── main.jsx
├── vercel.json
├── vite.config.js
└── index.html
```

## Getting Started

### Prerequisites
Node.js >= 18.x, MongoDB, Cloudinary account

### 1. Clone the repository
```bash
git clone https://github.com/your-username/election-assistant.git
cd election-assistant
```

### 2. Backend Setup
```bash
cd election-backend
npm install
cp .env.example .env
# Edit .env with your actual values
npm run seed -- -i    # Seeds the database + creates admin user
npm run dev           # Starts on port 5000
```

### 3. Frontend Setup
```bash
cd election-frontend
npm install
echo "VITE_API_URL=http://localhost:5000/api" > .env
npm run dev           # Starts on port 5173
```

### Environment Variables (Backend)
| Variable | Description | Example |
|----------|-------------|---------|
| MONGO_URI | MongoDB connection string | `mongodb+srv://...` |
| JWT_SECRET | Secret for access tokens (32+ chars) | `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| JWT_EXPIRE | Access token expiry | `15m` |
| REFRESH_TOKEN_SECRET | Secret for refresh tokens (32+ chars) | *(same command as above)* |
| CLOUDINARY_CLOUD_NAME | Your Cloudinary cloud name | `dxyz123` |
| CLOUDINARY_API_KEY | Cloudinary API key | `123456789` |
| CLOUDINARY_API_SECRET | Cloudinary API secret | `abcdefg` |
| FRONTEND_URL | Frontend URL for CORS | `https://your-app.vercel.app` |

## API Endpoints

### Auth
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | /api/auth/register | Public |
| POST | /api/auth/login | Public |
| POST | /api/auth/refresh | Public |
| POST | /api/auth/logout | Private |
| GET | /api/auth/me | Private |

### Content
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | /api/content/timeline | Public |
| GET | /api/content/steps | Public |
| GET | /api/content/glossary?search=term | Public |
| GET | /api/content/quiz | Public |

All GET endpoints support `?page=1&limit=20` query parameters.

### Progress
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | /api/progress/quiz | Private |
| POST | /api/progress/step | Private |
| GET | /api/progress/dashboard | Private |

### System
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | /api/health | Public |

## Admin Panel
Navigate to `/admin` after logging in with an admin account.
Features: Analytics dashboard, CRUD for all content types, image uploads.

## Deployment

### Backend (Render — free tier)
1. Push repo to GitHub
2. Go to [render.com](https://render.com) → New Web Service → Connect GitHub repo
3. Root directory: `election-backend`
4. Build command: `npm install` | Start command: `node server.js`
5. Add all environment variables from `.env.example`
6. Deploy → copy the service URL

### Frontend (Vercel — free tier)
1. Go to [vercel.com](https://vercel.com) → Import GitHub repo
2. Root directory: `election-frontend`
3. Add env var: `VITE_API_URL` = your Render URL + `/api`
4. Deploy → copy the URL → paste into backend `FRONTEND_URL` env var

### Seed Production Database
In Render dashboard → Shell tab:
```bash
node data/seed.js -i
```

## Pre-Deployment Checklist
- [ ] Set GitHub Secrets for Actions (`RENDER_DEPLOY_HOOK_URL`, `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`)
- [ ] Add `0.0.0.0/0` to MongoDB Atlas IP whitelist (or Render's static IPs)
- [ ] Confirm all Cloudinary env vars are set in Render dashboard
- [ ] Run `node data/seed.js -i` in Render Shell after first deploy
- [ ] Verify `/api/health` returns `200 OK`
- [ ] Update `README.md` Live Demo links with real URLs

## Contributing
1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License
MIT
