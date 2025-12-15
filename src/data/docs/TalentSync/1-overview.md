# Overview

> Source: https://deepwiki.com/harleenkaur28/AI-Resume-Parser/1-overview

# Overview

Relevant source files

* [.gitignore](https://github.com/harleenkaur28/AI-Resume-Parser/blob/b2bbd83d/.gitignore)
* [backend/app/agents/github\_agent.py](https://github.com/harleenkaur28/AI-Resume-Parser/blob/b2bbd83d/backend/app/agents/github_agent.py)
* [backend/app/model/best\_model.pkl](https://github.com/harleenkaur28/AI-Resume-Parser/blob/b2bbd83d/backend/app/model/best_model.pkl)
* [backend/app/model/tfidf.pkl](https://github.com/harleenkaur28/AI-Resume-Parser/blob/b2bbd83d/backend/app/model/tfidf.pkl)
* [backend/pyproject.toml](https://github.com/harleenkaur28/AI-Resume-Parser/blob/b2bbd83d/backend/pyproject.toml)
* [backend/requirements.txt](https://github.com/harleenkaur28/AI-Resume-Parser/blob/b2bbd83d/backend/requirements.txt)
* [backend/server.py](https://github.com/harleenkaur28/AI-Resume-Parser/blob/b2bbd83d/backend/server.py)
* [backend/uv.lock](https://github.com/harleenkaur28/AI-Resume-Parser/blob/b2bbd83d/backend/uv.lock)
* [frontend/app/about/page.tsx](https://github.com/harleenkaur28/AI-Resume-Parser/blob/b2bbd83d/frontend/app/about/page.tsx)
* [frontend/app/page.tsx](https://github.com/harleenkaur28/AI-Resume-Parser/blob/b2bbd83d/frontend/app/page.tsx)
* [frontend/components/about/ambient-bg.tsx](https://github.com/harleenkaur28/AI-Resume-Parser/blob/b2bbd83d/frontend/components/about/ambient-bg.tsx)
* [frontend/components/about/back-to-top.tsx](https://github.com/harleenkaur28/AI-Resume-Parser/blob/b2bbd83d/frontend/components/about/back-to-top.tsx)
* [frontend/components/about/competitive-edge-table.tsx](https://github.com/harleenkaur28/AI-Resume-Parser/blob/b2bbd83d/frontend/components/about/competitive-edge-table.tsx)
* [frontend/components/about/database-architecture.tsx](https://github.com/harleenkaur28/AI-Resume-Parser/blob/b2bbd83d/frontend/components/about/database-architecture.tsx)
* [frontend/components/about/dual-value.tsx](https://github.com/harleenkaur28/AI-Resume-Parser/blob/b2bbd83d/frontend/components/about/dual-value.tsx)
* [frontend/components/about/market-growth.tsx](https://github.com/harleenkaur28/AI-Resume-Parser/blob/b2bbd83d/frontend/components/about/market-growth.tsx)
* [frontend/components/about/problem-stats.tsx](https://github.com/harleenkaur28/AI-Resume-Parser/blob/b2bbd83d/frontend/components/about/problem-stats.tsx)
* [frontend/components/features.tsx](https://github.com/harleenkaur28/AI-Resume-Parser/blob/b2bbd83d/frontend/components/features.tsx)
* [frontend/components/landing-hero.tsx](https://github.com/harleenkaur28/AI-Resume-Parser/blob/b2bbd83d/frontend/components/landing-hero.tsx)
* [frontend/components/sidebar-provider.tsx](https://github.com/harleenkaur28/AI-Resume-Parser/blob/b2bbd83d/frontend/components/sidebar-provider.tsx)
* [frontend/tsconfig.json](https://github.com/harleenkaur28/AI-Resume-Parser/blob/b2bbd83d/frontend/tsconfig.json)

## Purpose and Scope

TalentSync is an AI-powered hiring intelligence platform that automates resume analysis, candidate evaluation, and job application workflows for both job seekers and recruiters. This document provides a high-level introduction to the system architecture, target users, core capabilities, and technology stack.

For detailed information on specific subsystems:

* Backend service implementation details, see [Backend Services](/harleenkaur28/AI-Resume-Parser/3-backend-services)
* Frontend application structure, see [Frontend Application](/harleenkaur28/AI-Resume-Parser/4-frontend-application)
* Database schema and data models, see [Database & Data Models](/harleenkaur28/AI-Resume-Parser/5-database-and-data-models)
* Deployment infrastructure, see [Deployment & Infrastructure](/harleenkaur28/AI-Resume-Parser/6-deployment-and-infrastructure)

**Sources**: [frontend/app/about/page.tsx22-25](https://github.com/harleenkaur28/AI-Resume-Parser/blob/b2bbd83d/frontend/app/about/page.tsx#L22-L25) [backend/server.py52-56](https://github.com/harleenkaur28/AI-Resume-Parser/blob/b2bbd83d/backend/server.py#L52-L56)

---

## System Architecture Overview

TalentSync implements a three-tier architecture consisting of a Next.js frontend, FastAPI backend, and PostgreSQL database, with extensive integration of AI/ML services.

**Sources**: [backend/server.py52-86](https://github.com/harleenkaur28/AI-Resume-Parser/blob/b2bbd83d/backend/server.py#L52-L86) [backend/pyproject.toml1-40](https://github.com/harleenkaur28/AI-Resume-Parser/blob/b2bbd83d/backend/pyproject.toml#L1-L40) [frontend/tsconfig.json1-28](https://github.com/harleenkaur28/AI-Resume-Parser/blob/b2bbd83d/frontend/tsconfig.json#L1-L28)

---

## System Components

### Frontend Application Stack

| Component | Technology | Location | Purpose |
| --- | --- | --- | --- |
| **Framework** | Next.js 14+ | `frontend/app/` | Server-side rendering, routing |
| **Authentication** | NextAuth.js | `frontend/app/api/auth/` | Multi-provider auth (email, OAuth) |
| **Database ORM** | Prisma Client | `frontend/prisma/` | Type-safe database access |
| **PWA Support** | Workbox | Service worker | Offline capabilities, caching |
| **Analytics** | PostHog | Client-side | Product analytics |
| **UI Framework** | React + TypeScript | `frontend/components/` | Component architecture |

**Sources**: [frontend/tsconfig.json1-28](https://github.com/harleenkaur28/AI-Resume-Parser/blob/b2bbd83d/frontend/tsconfig.json#L1-L28) [frontend/app/about/page.tsx1-63](https://github.com/harleenkaur28/AI-Resume-Parser/blob/b2bbd83d/frontend/app/about/page.tsx#L1-L63) [frontend/components/sidebar-provider.tsx1-28](https://github.com/harleenkaur28/AI-Resume-Parser/blob/b2bbd83d/frontend/components/sidebar-provider.tsx#L1-L28)

### Backend Service Stack

| Component | Technology | Location | Purpose |
| --- | --- | --- | --- |
| **API Framework** | FastAPI | `backend/server.py` | REST API endpoints |
| **LLM Integration** | LangChain + Gemini 2.0 | `backend/server.py:68-86` | Prompt engineering, LLM calls |
| **Workflow Engine** | LangGraph | Backend services | Multi-step AI workflows |
| **NLP Processing** | spaCy + NLTK | `backend/server.py:702-711` | Text cleaning, lemmatization |
| **ML Classifier** | scikit-learn | `backend/app/model/best_model.pkl` | Job category prediction |
| **Document Parsing** | PyPDF2, python-docx | `backend/server.py:752-793` | Resume text extraction |
| **GitHub Analysis** | gitingest | `backend/app/agents/github_agent.py` | Repository ingestion |

**Sources**: [backend/server.py1-86](https://github.com/harleenkaur28/AI-Resume-Parser/blob/b2bbd83d/backend/server.py#L1-L86) [backend/pyproject.toml1-40](https://github.com/harleenkaur28/AI-Resume-Parser/blob/b2bbd83d/backend/pyproject.toml#L1-L40) [backend/requirements.txt1-121](https://github.com/harleenkaur28/AI-Resume-Parser/blob/b2bbd83d/backend/requirements.txt#L1-L121)

---

## Target Users and Use Cases

TalentSync serves two distinct user segments with different feature sets:

### Job Seeker Features

| Feature | Description | Primary Backend Endpoint |
| --- | --- | --- |
| **Resume Analysis** | ML-based job field prediction, skills extraction, work experience parsing | `POST /analyze_resume` |
| **ATS Evaluation** | Score resume against job descriptions, provide improvement suggestions | `POST /evaluate_resume_ats` |
| **Cold Mail Generation** | AI-generated personalized cold emails with company research | `POST /v2/generate_cold_mail` |
| **Hiring Assistant** | Generate interview answers based on resume and job context | `POST /generate_answer` |
| **LinkedIn Posts** | Create LinkedIn content from projects/achievements with GitHub integration | `POST /generate_linkedin_posts` |
| **Career Tips** | Personalized resume and interview tips based on job category | `GET /tips` |

### Recruiter Features

| Feature | Description | Primary Backend Endpoint |
| --- | --- | --- |
| **Bulk Resume Processing** | Upload ZIP files with multiple resumes for parallel processing | `POST /bulk_upload` |
| **Candidate Dashboard** | Structured view of parsed candidates with filtering and ranking | Database query via Prisma |
| **ATS Evaluation** | Evaluate candidate resumes against job requirements | `POST /evaluate_resume_ats` |

**Sources**: [frontend/app/about/page.tsx1-63](https://github.com/harleenkaur28/AI-Resume-Parser/blob/b2bbd83d/frontend/app/about/page.tsx#L1-L63) [frontend/components/features.tsx1-77](https://github.com/harleenkaur28/AI-Resume-Parser/blob/b2bbd83d/frontend/components/features.tsx#L1-L77) [frontend/components/landing-hero.tsx1-247](https://github.com/harleenkaur28/AI-Resume-Parser/blob/b2bbd83d/frontend/components/landing-hero.tsx#L1-L247)

---

## Core Processing Pipeline

The resume analysis pipeline demonstrates the integration of traditional ML and modern LLM techniques:

### Processing Stages

1. **Text Extraction** ([backend/server.py752-793](https://github.com/harleenkaur28/AI-Resume-Parser/blob/b2bbd83d/backend/server.py#L752-L793)): Handles PDF, DOCX, and TXT formats using PyPDF2 and python-docx libraries
2. **Text Cleaning** ([backend/server.py738-749](https://github.com/harleenkaur28/AI-Resume-Parser/blob/b2bbd83d/backend/server.py#L738-L749)): Applies spaCy lemmatization and NLTK stopword removal
3. **ML Classification** ([backend/server.py714-735](https://github.com/harleenkaur28/AI-Resume-Parser/blob/b2bbd83d/backend/server.py#L714-L735)): Uses pre-trained `best_model.pkl` (25 job categories) with TF-IDF features
4. **Field Extraction** ([backend/server.py923-1029](https://github.com/harleenkaur28/AI-Resume-Parser/blob/b2bbd83d/backend/server.py#L923-L1029)): Regex-based extraction of name, email, skills, work experience, projects
5. **LLM Enhancement** ([backend/server.py373-462](https://github.com/harleenkaur28/AI-Resume-Parser/blob/b2bbd83d/backend/server.py#L373-L462)): Google Gemini 2.0 Flash generates structured analysis via `ComprehensiveAnalysisData` schema
6. **Storage** (Prisma ORM): Persists both raw text and structured analysis in PostgreSQL

**Processing Time**: Typically 4-8 seconds for complete analysis including LLM calls.

**Sources**: [backend/server.py52-1029](https://github.com/harleenkaur28/AI-Resume-Parser/blob/b2bbd83d/backend/server.py#L52-L1029) [backend/app/model/best\_model.pkl1-5](https://github.com/harleenkaur28/AI-Resume-Parser/blob/b2bbd83d/backend/app/model/best_model.pkl#L1-L5) [backend/app/model/tfidf.pkl1-10](https://github.com/harleenkaur28/AI-Resume-Parser/blob/b2bbd83d/backend/app/model/tfidf.pkl#L1-L10)

---

## AI/ML Technology Stack

TalentSync employs a hybrid approach combining traditional machine learning with large language models:

| Component | Technology | Model/Version | Use Case |
| --- | --- | --- | --- |
| **Text Classification** | scikit-learn | GradientBoostingClassifier | Predict job field from resume text |
| **Feature Extraction** | scikit-learn | TfidfVectorizer | Convert text to ML features |
| **NLP Processing** | spaCy | en\_core\_web\_sm-3.8.0 | Lemmatization, tokenization |
| **Text Cleaning** | NLTK | stopwords corpus | Remove common words |
| **LLM Inference** | Google Generative AI | gemini-2.0-flash | Structured data extraction |
| **Prompt Engineering** | LangChain | v0.3.25+ | Template management, output parsing |
| **Workflow Orchestration** | LangGraph | v0.2.38+ | Multi-step agent workflows |
| **Web Search** | Tavily | v0.7.12+ | Company research, job insights |
| **Content Extraction** | Jina AI | r.jina.ai API | Markdown from URLs |
| **Repository Analysis** | gitingest | v0.3.1+ | GitHub code ingestion |

### LLM Configuration

The system uses Google's Gemini 2.0 Flash model with the following configuration:

```
```
# From backend/server.py:76-80
llm = ChatGoogleGenerativeAI(
    model="gemini-2.0-flash",
    google_api_key=google_api_key,
    temperature=0.1,
)
```
```

**Temperature**: Set to 0.1 for deterministic, factual outputs suitable for structured data extraction.

**Sources**: [backend/server.py68-86](https://github.com/harleenkaur28/AI-Resume-Parser/blob/b2bbd83d/backend/server.py#L68-L86) [backend/pyproject.toml6-31](https://github.com/harleenkaur28/AI-Resume-Parser/blob/b2bbd83d/backend/pyproject.toml#L6-L31) [backend/requirements.txt1-121](https://github.com/harleenkaur28/AI-Resume-Parser/blob/b2bbd83d/backend/requirements.txt#L1-L121)

---

## Data Models

### Pydantic Schemas

The backend uses Pydantic for request/response validation and data structuring:

| Schema | Purpose | Location | Key Fields |
| --- | --- | --- | --- |
| `ComprehensiveAnalysisData` | Structured resume analysis output | [backend/server.py198-208](https://github.com/harleenkaur28/AI-Resume-Parser/blob/b2bbd83d/backend/server.py#L198-L208) | `skills_analysis`, `recommended_roles`, `work_experience`, `projects`, `education` |
| `WorkExperienceEntry` | Work history entry | [backend/server.py88-92](https://github.com/harleenkaur28/AI-Resume-Parser/blob/b2bbd83d/backend/server.py#L88-L92) | `role`, `company`, `duration`, `description` |
| `ProjectEntry` | Project details | [backend/server.py95-98](https://github.com/harleenkaur28/AI-Resume-Parser/blob/b2bbd83d/backend/server.py#L95-L98) | `title`, `technologies_used`, `description` |
| `SkillProficiency` | Skill with proficiency level | [backend/server.py173-175](https://github.com/harleenkaur28/AI-Resume-Parser/blob/b2bbd83d/backend/server.py#L173-L175) | `skill_name`, `percentage` |
| `LanguageEntry` | Language proficiency | [backend/server.py190-191](https://github.com/harleenkaur28/AI-Resume-Parser/blob/b2bbd83d/backend/server.py#L190-L191) | `language` |
| `EducationEntry` | Educational qualification | [backend/server.py194-195](https://github.com/harleenkaur28/AI-Resume-Parser/blob/b2bbd83d/backend/server.py#L194-L195) | `education_detail` |

### Database Schema

The PostgreSQL database uses Prisma ORM for type-safe access. Key tables include:

* **User**: Authentication and profile data
* **Resume**: Uploaded resume files and metadata
* **Analysis**: Structured analysis results linked to resumes
* **Session**: NextAuth session management
* **VerificationToken**: Email verification tokens

For complete schema details, see [Database & Data Models](/harleenkaur28/AI-Resume-Parser/5-database-and-data-models).

**Sources**: [backend/server.py88-208](https://github.com/harleenkaur28/AI-Resume-Parser/blob/b2bbd83d/backend/server.py#L88-L208)

---

## Deployment Architecture

TalentSync is deployed as a multi-container Docker Compose application:

### Container Specifications

| Container | Base Image | Runtime | Build Command | Startup Command |
| --- | --- | --- | --- | --- |
| **Frontend** | `oven/bun:1-slim` | Bun | `bun install && bun run build` | `bun run start` |
| **Backend** | `python:3.13-slim` | Python 3.13 | `uv sync` | `uvicorn backend.server:app --host 0.0.0.0 --port 8000` |
| **Database** | `postgres:16` | PostgreSQL 16 | N/A (official image) | N/A (managed by Docker) |

### CI/CD Pipeline

GitHub Actions automatically deploys on push to `main` branch:

1. SSH into VPS
2. Pull latest code
3. Rebuild Docker images
4. Restart containers with zero downtime

For detailed deployment configuration, see [Deployment & Infrastructure](/harleenkaur28/AI-Resume-Parser/6-deployment-and-infrastructure).

**Sources**: [.gitignore1-59](https://github.com/harleenkaur28/AI-Resume-Parser/blob/b2bbd83d/.gitignore#L1-L59)

---

## Key Differentiators

TalentSync distinguishes itself through several technical capabilities:

| Feature | Implementation | Benefit |
| --- | --- | --- |
| **Hybrid ML+LLM Pipeline** | scikit-learn classifier → Gemini 2.0 | Fast categorization + deep semantic understanding |
| **Context-Aware Analysis** | LangChain prompt templates | Domain-specific extraction and recommendations |
| **GitHub Integration** | gitingest library + Jina AI | Analyze projects from repositories for LinkedIn content |
| **Multi-Step Workflows** | LangGraph state machines | Complex agent behaviors (ATS evaluation, research) |
| **Dual-Sided Platform** | Seeker + Recruiter features | Network effects from both supply and demand |
| **PWA Capabilities** | Workbox service worker | Offline access, app-like experience |
| **Type Safety** | TypeScript + Pydantic | Reduced runtime errors, better DX |

**Sources**: [frontend/components/about/competitive-edge-table.tsx1-83](https://github.com/harleenkaur28/AI-Resume-Parser/blob/b2bbd83d/frontend/components/about/competitive-edge-table.tsx#L1-L83) [frontend/components/about/dual-value.tsx1-101](https://github.com/harleenkaur28/AI-Resume-Parser/blob/b2bbd83d/frontend/components/about/dual-value.tsx#L1-L101) [backend/app/agents/github\_agent.py1-418](https://github.com/harleenkaur28/AI-Resume-Parser/blob/b2bbd83d/backend/app/agents/github_agent.py#L1-L418)

---

## System Metrics

Based on platform usage as displayed on landing pages:

| Metric | Value | Context |
| --- | --- | --- |
| **Resumes Parsed** | 12,000+ | Total documents processed |
| **Average Time Saved** | 6 hours/week | Per user estimate |
| **Generated Assets** | 30,000+ | Cold emails, LinkedIn posts, tips |
| **Job Categories** | 25 | ML classifier output classes |
| **Processing Time** | 4-8 seconds | Complete resume analysis |

**Market Context** (from about page):

* AI in HR market: $6.05B (2024) → $14.08B (2029), 19.1% CAGR
* Resume parsing market: $20.19B (2024) → $43.20B (2029), 114% growth

**Sources**: [frontend/components/landing-hero.tsx119-136](https://github.com/harleenkaur28/AI-Resume-Parser/blob/b2bbd83d/frontend/components/landing-hero.tsx#L119-L136) [frontend/components/about/problem-stats.tsx1-80](https://github.com/harleenkaur28/AI-Resume-Parser/blob/b2bbd83d/frontend/components/about/problem-stats.tsx#L1-L80) [frontend/components/about/market-growth.tsx1-115](https://github.com/harleenkaur28/AI-Resume-Parser/blob/b2bbd83d/frontend/components/about/market-growth.tsx#L1-L115)

---

## Next Steps

For detailed information on specific subsystems:

* **Backend Implementation**: See [Backend Services](/harleenkaur28/AI-Resume-Parser/3-backend-services) for API endpoints, ML services, and agent architecture
* **Frontend Features**: See [Frontend Application](/harleenkaur28/AI-Resume-Parser/4-frontend-application) for page structure, authentication, and UI components
* **Data Layer**: See [Database & Data Models](/harleenkaur28/AI-Resume-Parser/5-database-and-data-models) for schema design and relationships
* **Operations**: See [Deployment & Infrastructure](/harleenkaur28/AI-Resume-Parser/6-deployment-and-infrastructure) for Docker setup, CI/CD, and monitoring