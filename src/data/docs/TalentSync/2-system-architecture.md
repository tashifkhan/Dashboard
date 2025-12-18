# System Architecture

## Purpose and Scope

This document describes the overall system architecture of TalentSync, explaining how the frontend, backend, database, and external services interact to form a complete AI-powered hiring intelligence platform. It covers the three-tier architecture, service organization, API design patterns, and deployment configuration.

For detailed information about specific subsystems, see:

* Backend service implementations: [Backend Services](/harleenkaur28/AI-Resume-Parser/3-backend-services)
* Frontend application structure: [Frontend Application](/harleenkaur28/AI-Resume-Parser/4-frontend-application)
* Database schema details: [Database & Data Models](/harleenkaur28/AI-Resume-Parser/5-database-and-data-models)
* Deployment and infrastructure: [Deployment & Infrastructure](/harleenkaur28/AI-Resume-Parser/6-deployment-and-infrastructure)

---

## Three-Tier Architecture Overview

TalentSync follows a classic three-tier architecture with clear separation of concerns:

**Sources:** [backend/app/main.py1-149](https://github.com/harleenkaur28/AI-Resume-Parser/blob/b2bbd83d/backend/app/main.py#L1-L149) [docker-compose.yaml1-78](https://github.com/harleenkaur28/AI-Resume-Parser/blob/b2bbd83d/docker-compose.yaml#L1-L78) [frontend/next.config.js1-82](https://github.com/harleenkaur28/AI-Resume-Parser/blob/b2bbd83d/frontend/next.config.js#L1-L82)

---

## API Organization and Versioning

The backend uses FastAPI with a modular router structure. Each feature domain has its own router module, and many endpoints support multiple API versions (`/api/v1` and `/api/v2`) to maintain backward compatibility while introducing new input methods.

### Router Registration Pattern

Each feature is encapsulated in its own module with separate routers for file-based (v1) and text-based (v2) inputs:

| Feature | File-Based Router (v1) | Text-Based Router (v2) | Module Path |
| --- | --- | --- | --- |
| Resume Analysis | `resume_file_based_router` | `resume_text_based_router` | `app.routes.resume_analysis` |
| ATS Evaluation | `ats_file_based_router` | `ats_text_based_router` | `app.routes.ats` |
| Cold Mail Generator | `cold_mail_file_based_router` | `cold_mail_text_based_router` | `app.routes.cold_mail` |
| Hiring Assistant | `hiring_file_based_router` | `hiring_text_based_router` | `app.routes.hiring_assistant` |
| Tailored Resume | `tailored_resume_file_based_router` | `tailored_resume_text_based_router` | `app.routes.tailored_resume` |
| LinkedIn Services | `linkedin_router` | N/A | `app.routes.linkedin` |
| Tips Generator | `tips_router` | N/A | `app.routes.tips` |
| Database API | `postgres_router` | N/A | `app.routes.postgres` |

**Sources:** [backend/app/main.py19-148](https://github.com/harleenkaur28/AI-Resume-Parser/blob/b2bbd83d/backend/app/main.py#L19-L148)

---

## Client Layer Architecture

The client layer consists of the web browser and Progressive Web App (PWA) capabilities provided by service workers. This enables offline functionality and app-like behavior.

### PWA Configuration

The PWA is configured using `next-pwa` with automatic service worker generation. It is disabled during development to avoid caching issues and enabled in production for offline support.

**Sources:** [frontend/next.config.js1-6](https://github.com/harleenkaur28/AI-Resume-Parser/blob/b2bbd83d/frontend/next.config.js#L1-L6) [frontend/package.json68](https://github.com/harleenkaur28/AI-Resume-Parser/blob/b2bbd83d/frontend/package.json#L68-L68)

---

## Frontend Application Layer

The frontend is built with Next.js 15 and uses modern React patterns with TypeScript. It communicates with both the FastAPI backend and the PostgreSQL database (via Prisma).

### Frontend Technology Stack

### Webpack Configuration for PostHog

The frontend includes custom Webpack configuration to handle PostHog's Node.js dependencies in browser builds. This prevents module resolution errors when bundling for the client.

**Sources:** [frontend/package.json1-98](https://github.com/harleenkaur28/AI-Resume-Parser/blob/b2bbd83d/frontend/package.json#L1-L98) [frontend/next.config.js18-62](https://github.com/harleenkaur28/AI-Resume-Parser/blob/b2bbd83d/frontend/next.config.js#L18-L62)

---

## Backend Application Layer

The backend is a FastAPI application running on Python 3.13 with a modular architecture. Each AI service is isolated in its own router module.

### Backend Service Modules

### API Versioning Strategy

The backend implements a dual-version strategy:

* **v1 endpoints**: Accept file uploads (PDF, DOCX, TXT) via `multipart/form-data`
* **v2 endpoints**: Accept raw resume text as JSON payloads

This allows the frontend to cache analysis results and pass them directly to subsequent services without re-uploading files, improving performance and user experience.

**Example:**

```
v1: POST /api/v1/analyze_resume (file upload) → analysis result
v2: POST /api/v2/generate_cold_mail (text input from cached analysis) → cold email
```

**Sources:** [backend/app/main.py1-149](https://github.com/harleenkaur28/AI-Resume-Parser/blob/b2bbd83d/backend/app/main.py#L1-L149)

---

## Data Layer Architecture

The data layer consists of PostgreSQL for persistent data storage, file system storage for uploaded resumes, and pre-trained ML models for classification.

### Database Connection Pattern

Both frontend and backend connect to the same PostgreSQL instance but through different mechanisms:

* **Frontend**: Uses Prisma ORM with full type safety and migrations
* **Backend**: Direct SQL connections for high-performance queries (if needed)

The `DATABASE_URL` environment variable follows this format:

```
postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}?schema=public
```

**Sources:** [docker-compose.yaml4-18](https://github.com/harleenkaur28/AI-Resume-Parser/blob/b2bbd83d/docker-compose.yaml#L4-L18) [docker-compose.yaml42-68](https://github.com/harleenkaur28/AI-Resume-Parser/blob/b2bbd83d/docker-compose.yaml#L42-L68)

---

## Inter-Service Communication

Services communicate through a combination of HTTP APIs and shared database access. The Docker Compose network configuration enables internal service discovery.

### Communication Patterns

| Source | Target | Protocol | Purpose | Configuration |
| --- | --- | --- | --- | --- |
| Browser | Frontend | HTTPS | UI + API routes | Nginx proxy: `talentsync.tashif.codes` |
| Frontend | Backend | HTTP | AI service calls | `BACKEND_URL=http://backend:8000` |
| Frontend | PostgreSQL | TCP/5432 | Database queries | `DATABASE_URL` (Prisma) |
| Backend | PostgreSQL | TCP/5432 | Data persistence | `DATABASE_URL` |
| Backend | Google AI | HTTPS | LLM inference | `GOOGLE_API_KEY` |
| Backend | Tavily | HTTPS | Web search | `TAVILY_API_KEY` |
| Backend | Jina AI | HTTPS | Content extraction | `https://r.jina.ai` |

**Sources:** [docker-compose.yaml42-78](https://github.com/harleenkaur28/AI-Resume-Parser/blob/b2bbd83d/docker-compose.yaml#L42-L78)

---

## External Service Integration

The backend integrates with several external AI and data services to provide comprehensive functionality.

### LLM Configuration

All services use Google's Gemini 2.0 Flash model through LangChain:

* **Model**: `gemini-2.0-flash` (primary), `gemini-2.0-flash-lite` (fallback)
* **Temperature**: 0.1 (for deterministic outputs)
* **Integration**: `langchain_google_genai.ChatGoogleGenerativeAI`

**Sources:** [backend/experiment/exp.ipynb107-108](https://github.com/harleenkaur28/AI-Resume-Parser/blob/b2bbd83d/backend/experiment/exp.ipynb#L107-L108)

---

## Deployment Architecture

The application is deployed using Docker Compose with three main containers orchestrated on a VPS.

### Container Startup Sequence

1. **Database Container**: Starts first, initializes PostgreSQL with environment variables
2. **Backend Container**: Builds from [backend/Dockerfile1-33](https://github.com/harleenkaur28/AI-Resume-Parser/blob/b2bbd83d/backend/Dockerfile#L1-L33) waits for database
3. **Frontend Container**: Builds, runs Prisma migrations, seeds database, starts Next.js server

The frontend container startup command:

```
bunx prisma migrate deploy && bun prisma/seed.ts && bun run start
```

This ensures the database schema is up-to-date before the application starts.

**Sources:** [docker-compose.yaml1-78](https://github.com/harleenkaur28/AI-Resume-Parser/blob/b2bbd83d/docker-compose.yaml#L1-L78) [backend/Dockerfile1-33](https://github.com/harleenkaur28/AI-Resume-Parser/blob/b2bbd83d/backend/Dockerfile#L1-L33)

---

## Environment Configuration

The system uses environment variables for all configuration, loaded from a single `.env` file in the project root.

### Critical Environment Variables

| Variable | Used By | Purpose |
| --- | --- | --- |
| `POSTGRES_DB` | db, frontend, backend | Database name |
| `POSTGRES_USER` | db, frontend, backend | Database username |
| `POSTGRES_PASSWORD` | db, frontend, backend | Database password |
| `DATABASE_URL` | frontend, backend | Full PostgreSQL connection string |
| `BACKEND_URL` | frontend | Internal backend service URL |
| `NEXTAUTH_URL` | frontend | Authentication callback URL |
| `NEXTAUTH_SECRET` | frontend | Session encryption key |
| `GOOGLE_API_KEY` | backend | Google Gemini AI authentication |
| `TAVILY_API_KEY` | backend | Tavily search authentication |
| `NODE_ENV` | frontend | Environment mode (production/development) |

### Build-time vs Runtime Variables

* **Build-time**: Variables prefixed with `NEXT_PUBLIC_*` are embedded into the frontend bundle
* **Runtime**: All other variables are loaded from the environment at container startup

**Sources:** [docker-compose.yaml7-62](https://github.com/harleenkaur28/AI-Resume-Parser/blob/b2bbd83d/docker-compose.yaml#L7-L62) [.gitignore32-59](https://github.com/harleenkaur28/AI-Resume-Parser/blob/b2bbd83d/.gitignore#L32-L59)

---

## API Request Flow Example

The following diagram shows a complete request flow for the resume analysis feature, demonstrating how all tiers interact:

This flow demonstrates:

1. PWA-enabled navigation
2. Frontend-backend API communication
3. Hybrid AI approach (ML + LLM)
4. Database persistence through multiple access patterns
5. Frontend data caching for performance

**Sources:** [backend/app/main.py1-149](https://github.com/harleenkaur28/AI-Resume-Parser/blob/b2bbd83d/backend/app/main.py#L1-L149) [frontend/package.json1-98](https://github.com/harleenkaur28/AI-Resume-Parser/blob/b2bbd83d/frontend/package.json#L1-L98)

---

## Summary

TalentSync's architecture follows these key principles:

1. **Separation of Concerns**: Clear boundaries between presentation (Next.js), business logic (FastAPI), and data (PostgreSQL)
2. **Modularity**: Each AI service is isolated in its own router module with dedicated endpoints
3. **API Versioning**: Supports both file-based and text-based inputs for flexibility
4. **Progressive Enhancement**: PWA capabilities for offline support
5. **Containerization**: Docker Compose orchestration for consistent deployments
6. **External Integration**: Leverages best-in-class AI services (Gemini, Tavily, Jina)
7. **Dual Database Access**: Frontend uses Prisma ORM, backend can use direct SQL
8. **Internal Networking**: Service-to-service communication via Docker network

This architecture enables rapid feature development while maintaining scalability and maintainability.
