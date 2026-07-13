# 💌 FirstPage

> An AI-powered personalized microsite generator for proposals, friendship requests, apologies, birthdays, celebrations, and other heartfelt moments.

![Java](https://img.shields.io/badge/Java-17-orange) ![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4-green) ![React](https://img.shields.io/badge/React-19-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-6-blue) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)

---

## ✨ Features

- **🎨 13 Categories** — Crush, Friendship, Apology, Birthday, Anniversary, Farewell, Proposal, Thank You, Congratulations, Family, Graduation, Baby Welcome, Custom
- **🤖 AI Content Generation** — Category-aware creative writing powered by Gemini/OpenAI
- **📱 Slide-based Microsites** — Drag-and-drop editor with multiple slide types
- **🎭 Premium Themes** — Beautiful, pre-designed themes for every occasion
- **📸 Media Uploads** — Images and videos via Cloudinary
- **🔗 Shareable Links** — Custom slugs with password protection & one-time view
- **💝 Reactions & Replies** — Recipients can react and reply privately
- **📊 Analytics Dashboard** — Views, unique visitors, reactions, time spent
- **🔔 Notifications** — Real-time alerts when someone views or reacts

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, Redux Toolkit, TanStack Query, Framer Motion |
| **Backend** | Spring Boot 3.4, Java 17, Spring Security, Spring Data JPA, MapStruct, Lombok |
| **Database** | PostgreSQL 16 + Flyway migrations |
| **Auth** | Firebase Authentication (Google Sign-In) |
| **Storage** | Cloudinary (images, videos) |
| **AI** | Pluggable provider (Gemini / OpenAI via REST) |

---

## 🚀 Quick Start

### Prerequisites

- Java 17+
- Node.js 20+
- PostgreSQL 16 (or use Docker)
- Firebase project with Google Sign-In enabled
- Cloudinary account
- Gemini API key

### 1. Clone

```bash
git clone https://github.com/anshrajshukla1/FirstPage.git
cd FirstPage
```

### 2. Backend Setup

```bash
cd backend

# Copy env and fill in your values
cp .env.example .env

# Edit .env with your credentials:
# DB_URL, DB_USERNAME, DB_PASSWORD
# CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
# GEMINI_API_KEY
# FIREBASE_SERVICE_ACCOUNT_PATH (path to your service-account.json)

# Run with Maven wrapper
./mvnw spring-boot:run
```

The backend starts at **http://localhost:8080**. Swagger UI is available at **http://localhost:8080/swagger-ui.html**.

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy env
cp .env.example .env.local

# Edit .env.local with your Firebase config

# Start dev server
npm run dev
```

The frontend starts at **http://localhost:5173**.

---

## 🐳 Docker Deployment

### Using Docker Compose (recommended)

```bash
# Create a .env file at the root with all required variables
cp backend/.env.example .env

# Add to .env:
# CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com
# FIREBASE_CREDENTIALS_JSON=<your Firebase service account JSON as a single line>
# VITE_API_BASE_URL=https://your-backend-domain.com/api/v1

# Build and start all services
docker compose up --build -d
```

This starts:
- **PostgreSQL** on port 5432
- **Backend** on port 8080
- **Frontend** on port 3000

### Individual Docker builds

```bash
# Backend
cd backend
docker build -t firstpage-backend .
docker run -p 8080:8080 --env-file .env firstpage-backend

# Frontend
cd frontend
docker build --build-arg VITE_API_BASE_URL=https://api.yoursite.com/api/v1 -t firstpage-frontend .
docker run -p 3000:80 firstpage-frontend
```

---

## ☁️ Cloud Deployment

### Backend (Railway / Render / Fly.io)

1. Connect your GitHub repo
2. Set the **Root Directory** to `backend`
3. Set **Build Command**: `./mvnw package -DskipTests`
4. Set **Start Command**: `java -jar target/*.jar`
5. Add environment variables:

| Variable | Description |
|----------|-------------|
| `SPRING_PROFILES_ACTIVE` | `prod` |
| `DB_URL` | `jdbc:postgresql://host:5432/dbname` |
| `DB_USERNAME` | Database username |
| `DB_PASSWORD` | Database password |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `GEMINI_API_KEY` | Google Gemini API key |
| `AI_DEFAULT_PROVIDER` | `gemini` |
| `FIREBASE_CREDENTIALS_JSON` | Firebase service account JSON (single line) |
| `CORS_ALLOWED_ORIGINS` | Frontend URL (e.g. `https://firstpage.vercel.app`) |

### Frontend (Vercel / Netlify)

1. Connect your GitHub repo
2. Set the **Root Directory** to `frontend`
3. Set **Build Command**: `npm run build`
4. Set **Output Directory**: `dist`
5. Add environment variables:

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | Backend URL (e.g. `https://firstpage-api.railway.app/api/v1`) |
| `VITE_FIREBASE_API_KEY` | Firebase web API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | `yourproject.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |

> **Note**: On Vercel, add a `vercel.json` with SPA rewrite:
> ```json
> { "rewrites": [{ "source": "/(.*)", "destination": "/" }] }
> ```

---

## 📁 Project Structure

```
FirstPage/
├── backend/
│   ├── src/main/java/com/firstpage/
│   │   ├── ai/              # AI orchestrator + strategy pattern
│   │   ├── config/           # App, Cloudinary, Firebase, OpenAPI, Web config
│   │   ├── controller/       # 9 REST controllers
│   │   ├── dto/              # Request/Response DTOs
│   │   ├── entity/           # 9 JPA entities + enums
│   │   ├── exception/        # Global exception handler (RFC 7807)
│   │   ├── mapper/           # MapStruct mappers
│   │   ├── media/            # Cloudinary media service
│   │   ├── repository/       # Spring Data JPA repositories
│   │   ├── security/         # Firebase JWT auth filter
│   │   ├── service/          # 8 business services
│   │   └── utils/            # Slug & date utilities
│   ├── src/main/resources/
│   │   ├── db/migration/     # 10 Flyway SQL migrations
│   │   ├── application.yml
│   │   └── application-prod.yml
│   ├── Dockerfile
│   └── pom.xml
├── frontend/
│   ├── src/
│   │   ├── api/              # Axios client + query keys
│   │   ├── components/       # Reusable UI components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── layouts/          # Root, Auth, Dashboard layouts
│   │   ├── pages/            # 8 page components
│   │   ├── routes/           # React Router config
│   │   ├── services/         # 6 API service modules
│   │   ├── store/            # Redux Toolkit store
│   │   └── types/            # TypeScript interfaces
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── docker-compose.yml
└── README.md
```

---

## 📄 API Documentation

When running locally, visit **http://localhost:8080/swagger-ui.html** for the full interactive API documentation.

Key API groups:
- `POST /api/v1/users/sync` — Sync Firebase user to DB
- `GET/POST /api/v1/microsites` — Microsite CRUD
- `POST /api/v1/ai/generate` — AI content generation
- `POST /api/v1/microsites/{id}/media` — Media upload
- `GET /api/v1/public/microsites/{slug}` — Public viewer
- `GET /api/v1/analytics/dashboard` — Analytics

---

## 📝 License

This project is private and proprietary.
