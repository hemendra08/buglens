# BugLens — Architecture

> Last updated: 2026-10-05

---

## Overview

BugLens is a **modular monolith** (Phase 1-8) designed to evolve toward a distributed service architecture (Phase 9+). The system is a developer-productivity platform focused on bug investigation and root-cause analysis — not a simple issue tracker.

---

## High-Level Architecture (Phase 1 Target)

```
┌─────────────────────────────────────────────────┐
│                  React Web App                  │
│          TypeScript · Vite · Ant Design         │
│     TanStack Router · TanStack Query · Zustand  │
└─────────────────────┬───────────────────────────┘
                      │ HTTPS / REST
                      ▼
┌─────────────────────────────────────────────────┐
│             ASP.NET Core Web API                │
│         C# · JWT Auth · Swagger/OpenAPI         │
│         FluentValidation · ILogger              │
└──────────┬──────────────────────────────────────┘
           │
    ┌──────┴──────────────────────┐
    ▼                             ▼
┌──────────────┐        ┌─────────────────────┐
│  Bug Module  │        │ Investigation Module │
│              │        │                     │
│ - Bug        │        │ - Investigation      │
│ - BugComment │        │ - Evidence           │
│ - Status     │        │ - ApiRequest         │
│ - Assignment │        │ - LogEntry           │
└──────┬───────┘        │ - RootCause          │
       │                │ - Fix                │
       │                └──────────┬──────────┘
       │                           │
       └─────────────┬─────────────┘
                     ▼
        ┌────────────────────────┐
        │      SQL Server        │
        │   Entity Framework     │
        └────────────────────────┘
```

---

## Module Breakdown

### Bug Module
Responsible for the full bug lifecycle.

- Bug entity (ID, title, description, severity, priority, status, etc.)
- Bug comments
- Assignment management
- Status transitions (OPEN → IN_PROGRESS → INVESTIGATING → … → CLOSED)

### Investigation Module
The core of BugLens. Extends a bug with a full investigation workspace.

- Evidence collection (screenshots, error messages, API responses)
- API request/response recording
- Error & stack trace capture
- Log association
- Investigation notes
- Root cause analysis (Symptom → Evidence → Hypothesis → Root Cause → Fix → Verification)
- Fix tracking
- Timeline events

### Auth Module
- JWT-based authentication
- Role-based authorization (Admin, Developer, QA)
- Password hashing (BCrypt)

### Integration Module (Future)
- Git/GitHub integration
- PR linking
- CI/CD pipeline tracking
- Deployment tracking

### AI Module (Future — Phase 7)
- Error analysis
- Root cause suggestions (labelled as "possible" not "confirmed")
- Investigation step suggestions

---

## Data Flow

```
User Action (UI)
    │
    ▼
TanStack Query / Axios → REST API
    │
    ▼
ASP.NET Core Controller
    │ Validates (FluentValidation / Zod on frontend)
    ▼
Service Layer
    │ Applies business logic
    ▼
Repository / EF Core DbContext
    │
    ▼
SQL Server Database
```

---

## Frontend Architecture

```
apps/web/
├── src/
│   ├── components/       # Shared UI components
│   ├── features/         # Feature-based modules
│   │   ├── bugs/
│   │   ├── investigation/
│   │   ├── auth/
│   │   └── dashboard/
│   ├── hooks/            # Shared custom hooks
│   ├── layouts/          # Page layouts (sidebar, top nav)
│   ├── lib/              # Axios instance, query client, etc.
│   ├── routes/           # TanStack Router route definitions
│   ├── store/            # Zustand global state
│   ├── types/            # Shared TypeScript types / DTOs
│   └── utils/            # Utility functions
```

---

## Backend Architecture

```
backend/BugLens.Api/
├── Controllers/          # API controllers (thin layer)
├── Services/             # Business logic
├── Repositories/         # Data access (EF Core)
├── Models/               # EF Core entities
├── DTOs/                 # Request/Response DTOs
├── Validators/           # FluentValidation validators
├── Middleware/           # Error handling, logging, auth
├── Configuration/        # App settings, JWT config
└── Migrations/           # EF Core migrations
```

---

## Database Schema (Initial — Phase 1-3)

```
Users
├── Id (Guid)
├── Name
├── Email
├── PasswordHash
├── Role (Admin | Developer | QA)
├── CreatedAt
└── UpdatedAt

Bugs
├── Id (Guid)
├── BugNumber (int, auto-increment display ID: BUG-1024)
├── Title
├── Description
├── Severity (CRITICAL | HIGH | MEDIUM | LOW)
├── Priority (URGENT | HIGH | MEDIUM | LOW)
├── Status (OPEN | IN_PROGRESS | ... | CLOSED)
├── Environment
├── StepsToReproduce
├── ExpectedResult
├── ActualResult
├── ReporterId (FK → Users)
├── AssigneeId (FK → Users, nullable)
├── CreatedAt
└── UpdatedAt

BugComments
├── Id (Guid)
├── BugId (FK → Bugs)
├── AuthorId (FK → Users)
├── Content
├── CreatedAt
└── UpdatedAt
```

Phase 4+ will add: Investigation, Evidence, ApiRequest, LogEntry, RootCause, Fix, TimelineEvent, etc.

---

## Security Architecture

- JWT Bearer tokens (short-lived access tokens)
- BCrypt password hashing
- Role-based authorization attributes on controllers
- CORS policy (frontend origin only)
- FluentValidation on all incoming DTOs
- No secrets in source code — environment variables / user secrets

---

## Future Evolution (Phase 9+)

The modular monolith can be split into microservices if needed:

```
Frontend
    ↓
API Gateway (YARP or similar)
    ↓
┌─────────────────────────────────────────┐
│  Bug Service  │  Investigation Service  │
│  Log Service  │  Integration Service    │
│  AI Service   │  Notification Service   │
└─────────────────────────────────────────┘
    ↓
Databases / Message Bus / External APIs
```

Observability stack to be added:
- OpenTelemetry for distributed tracing
- Structured logging (Serilog → Seq or similar)
- Sentry for error tracking
- Prometheus + Grafana for metrics

---

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Architecture | Modular Monolith | Avoid premature complexity, easy to split later |
| ORM | EF Core | First-class .NET support, migrations, LINQ |
| Auth | JWT | Stateless, scalable, standard |
| Frontend State | TanStack Query + Zustand | Server state vs. client state separation |
| Routing | TanStack Router | Type-safe, modern, file-based ready |
| UI Library | Ant Design | Rich component set for developer tools |
| Dependency Viz | React Flow | Best-in-class graph visualization for React |
| Charts | Recharts | Lightweight, composable |
| Validation | FluentValidation (API) + Zod (Frontend) | Layer-appropriate validation |
