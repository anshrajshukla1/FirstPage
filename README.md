# FirstPage — AI-Powered Personalized Microsite Generator

**FirstPage** is a full-stack web application designed to help users create, customize, and share highly personalized, interactive microsites for special occasions (birthdays, anniversaries, apologies, proposals, etc.). 

This document serves as a complete blueprint of the architecture, features, database schema, and API endpoints. **Any AI agent should be able to read this document and perfectly reconstruct or extend the system.**

---

## 🌟 Core Features

- **Authentication**: Firebase Google Sign-In with Spring Security JWT validation.
- **Microsite Builder**: Multi-slide editor with drag-and-drop reordering.
- **AI Assistant**: Integrated Gemini AI to generate heartfelt messages based on category, tone, and recipient.
- **Rich Slide Types**: Intro, Story, Photos, Video, Quote, Timeline, Countdown, Surprise, Proposal, Custom.
- **Media Upload**: Direct Cloudinary integration for images and videos with size validation.
- **Public Viewer**: Beautiful, animated, mobile-responsive viewer with swipe/keyboard navigation.
- **Interactions**: Visitors can leave emoji reactions (Heart, Laugh, Cry, Fire, Star) and text replies.
- **Security & Privacy**: Optional password protection, anonymous viewing, and one-time view enforcement.
- **Analytics**: Track views, unique visitors, time spent per slide, and device/country metrics.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19, Vite, TypeScript
- **Styling**: Tailwind CSS v4, Framer Motion (animations), Lucide React (icons)
- **State Management**: Redux Toolkit (Auth/UI state), TanStack Query v5 (Server state / Data fetching)
- **Routing**: React Router v7
- **Auth**: Firebase Authentication (Google Auth Provider)

### Backend
- **Framework**: Java 17, Spring Boot 3.4.1
- **Database**: PostgreSQL with Spring Data JPA
- **Migrations**: Flyway
- **Mapping & Boilerplate**: MapStruct 1.6.3, Lombok 1.18.46 (with `@SuperBuilder` for JDK 24 compatibility)
- **Security**: Spring Security (Stateless, Custom Firebase JWT Filter)
- **Documentation**: SpringDoc OpenAPI 3 (Swagger UI)

---

## 🗄️ Database Schema & Entities

The database is managed via Flyway migrations (`V1` to `V10`).

1. **User**: `id`, `firebaseUid` (unique), `email`, `displayName`, `photoUrl`, `role`, `lastLoginAt`
2. **Microsite**: `id`, `title`, `slug` (unique), `recipientName`, `category`, `status`, `themeId`, `passwordHash`, `isAnonymous`, `isOneTimeView`, `hasBeenViewed`, `musicUrl`, `scheduledAt`, `expiresAt`, `publishedAt`, `userId` (FK)
3. **Slide**: `id`, `orderIndex`, `type` (Enum), `title`, `content`, `animationType`, `backgroundType`, `micrositeId` (FK)
4. **Media**: `id`, `type`, `url`, `publicId`, `caption`, `orderIndex`, `fileSize`, `micrositeId` (FK), `slideId` (FK)
5. **Theme**: `id`, `name`, `slug`, `category`, `cssVariables`, `previewImageUrl`, `isPremium`, `isActive`
6. **Reaction**: `id`, `type`, `visitorSessionId`, `micrositeId` (FK)
7. **Reply**: `id`, `message`, `visitorSessionId`, `isRead`, `micrositeId` (FK)
8. **VisitorLog**: `id`, `sessionId`, `ipAddress`, `country`, `device`, `browser`, `currentSlideIndex`, `timeSpentSeconds`, `replayCount`, `visitedAt`, `micrositeId` (FK)
9. **Notification**: `id`, `type`, `message`, `isRead`, `userId` (FK), `micrositeId` (FK)
10. **AIPromptHistory**: `id`, `provider`, `promptType`, `inputPrompt`, `generatedOutput`, `userId` (FK)

*(All entities inherit from `BaseEntity` which provides `id`, `createdAt`, and `updatedAt`)*

---

## 🔌 API Endpoints

All endpoints are prefixed with `/api/v1`. All endpoints require a Firebase Bearer token except for those under `/public/`, `/actuator/`, and `/swagger-ui/`.

### 1. Auth & Users (`UserController`)
- `GET /users/me` — Get current authenticated user profile.
- `PUT /users/me` — Update user profile.
- `POST /users/sync` — Sync Firebase user data to the database after sign-in.

### 2. Microsites (`MicrositeController`)
- `GET /microsites` — List user's microsites (paginated).
- `POST /microsites` — Create a new microsite.
- `GET /microsites/{id}` — Get microsite details.
- `PUT /microsites/{id}` — Update microsite settings.
- `DELETE /microsites/{id}` — Delete microsite.
- `POST /microsites/{id}/publish` — Publish microsite (generates slug).
- `POST /microsites/{id}/duplicate` — Duplicate an existing microsite.

### 3. Slides (`SlideController`)
- `GET /microsites/{id}/slides` — Get all slides for a microsite.
- `POST /microsites/{id}/slides` — Add a new slide.
- `PUT /microsites/{id}/slides/{slideId}` — Update slide content/title.
- `DELETE /microsites/{id}/slides/{slideId}` — Delete a slide.
- `PUT /microsites/{id}/slides/reorder` — Reorder slides (expects array of IDs).

### 4. Public Viewer (`PublicViewerController` - No Auth)
- `GET /public/microsites/{slug}` — Get public payload for rendering.
- `POST /public/microsites/{slug}/verify-password` — Unlock a password-protected microsite.
- `POST /public/microsites/{id}/reactions` — Add an emoji reaction.
- `POST /public/microsites/{id}/replies` — Add a text reply.
- `POST /public/microsites/{id}/track` — Track visitor analytics (time spent, device).

### 5. Analytics & Notifications (`AnalyticsController`, `NotificationController`)
- `GET /analytics/dashboard` — Get global stats for the user (total views, reactions, etc.).
- `GET /analytics/microsites/{id}` — Get specific microsite stats.
- `GET /analytics/microsites/{id}/reactions` — Get grouped reaction counts.
- `GET /notifications` — List user notifications (paginated).
- `PUT /notifications/{id}/read` — Mark notification as read.
- `PUT /notifications/read-all` — Mark all as read.

### 6. Media & AI (`MediaController`, `AIController`)
- `POST /media/upload/image` — Upload image to Cloudinary (MultipartFile).
- `POST /media/upload/video` — Upload video to Cloudinary.
- `DELETE /media/{publicId}` — Delete media from Cloudinary.
- `POST /ai/generate` — Generate slide content using Gemini.

---

## 🚀 Running Locally

### Prerequisites
- JDK 17+ (Tested on JDK 24)
- Node.js 20+
- PostgreSQL running locally on port 5432
- Firebase Project (Authentication enabled)
- Cloudinary Account (API keys)
- Google Gemini API Key

### Environment Variables
**Frontend (`frontend/.env.local`)**:
```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
```

**Backend (`backend/src/main/resources/application.yml` or Env Vars)**:
```env
DB_URL=jdbc:postgresql://localhost:5432/firstpage
DB_USERNAME=postgres
DB_PASSWORD=postgres
FIREBASE_SERVICE_ACCOUNT_PATH=service-account.json
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
GEMINI_API_KEY=...
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

### Start Commands
**Backend**:
```bash
cd backend
mvn spring-boot:run
```
*(Runs on http://localhost:8080. Swagger UI at http://localhost:8080/swagger-ui.html)*

**Frontend**:
```bash
cd frontend
npm run dev
```
*(Runs on http://localhost:3001)*

---

## 🏗️ Architecture Notes for AI Agents

1. **Authentication Flow**: The frontend uses Firebase SDK to authenticate and retrieve a JWT. It intercepts all Axios requests to inject `Authorization: Bearer <token>`. The backend `FirebaseAuthenticationFilter` intercepts requests, validates the token using `FirebaseAuth.getInstance().verifyIdToken()`, and populates the Spring `SecurityContext`.
2. **Syncing**: Because Firebase manages the users, the frontend calls `/api/v1/users/sync` immediately after login to ensure the `users` table in PostgreSQL is populated and up to date.
3. **CORS**: Configured in both `SecurityConfig.java` and `WebConfig.java` in the backend. If adding new frontend ports, update `CORS_ALLOWED_ORIGINS`.
4. **MapStruct & Lombok**: The project uses MapStruct for entity-DTO mapping. Entities extend `BaseEntity` and use `@SuperBuilder` to allow MapStruct to access inherited fields during generation.

---
*Generated by Antigravity AI*
