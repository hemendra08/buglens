# BugLens

> **Automated Bug Investigation & Root-Cause Analysis Platform**

BugLens is a developer-productivity platform designed to reduce the manual effort of investigating software bugs. It is **not** a Jira clone — it is an investigation and developer-assistance platform.

---

## What is BugLens?

When a bug occurs in production or QA, developers typically spend hours:
- Manually gathering API logs
- Digging through stack traces
- Reproducing the issue
- Correlating frontend and backend errors
- Writing investigation notes across multiple tools

BugLens centralizes and eventually automates all of this into a single investigation workspace per bug.

---

## Core Lifecycle

```
Bug Report → Reproduce → Collect Evidence → Investigate
→ Find Root Cause → Implement Fix → Tests → Code Review
→ CI/CD → QA Verification → Deployment → Monitoring → Close
```

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, TypeScript, Vite, Ant Design |
| State | TanStack Query, Zustand |
| Routing | TanStack Router |
| Forms | React Hook Form + Zod |
| Visualization | React Flow, Recharts |
| Backend | ASP.NET Core, C#, .NET |
| Database | PostgreSQL + EF Core |
| Auth | JWT |
| Validation | FluentValidation |
| Testing | xUnit, Vitest, React Testing Library |
| API Docs | Swagger / OpenAPI |
| CI/CD | GitHub Actions |

---

## Project Structure

```
buglens/
├── apps/
│   └── web/              # React frontend
├── backend/
│   └── BugLens.Api/      # ASP.NET Core API
├── database/             # Migration scripts / seed data
├── docs/                 # Extended documentation
├── .changeset/           # Changesets for release management
├── .github/
│   └── workflows/        # GitHub Actions CI/CD
├── scripts/              # Developer utility scripts
├── README.md
├── PROJECT_STATUS.md     # Current progress tracker
├── ARCHITECTURE.md       # System architecture
├── CONTRIBUTING.md       # Developer guide
├── CHANGELOG.md          # Release history
└── .gitignore
```

---

## Getting Started

> Setup instructions will be added in Phase 1.

### Prerequisites

- Node.js 20+
- .NET 8 SDK
- PostgreSQL (or Docker)
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_ORG/buglens.git
cd buglens

# Install frontend dependencies
cd apps/web
npm install

# Run the backend
cd backend/BugLens.Api
dotnet restore
dotnet run
```

---

## Documentation

- [PROJECT_STATUS.md](./PROJECT_STATUS.md) — Current development progress
- [ARCHITECTURE.md](./ARCHITECTURE.md) — System design and decisions
- [CONTRIBUTING.md](./CONTRIBUTING.md) — How to contribute
- [CHANGELOG.md](./CHANGELOG.md) — Release history

---

## License

Internal proprietary software. All rights reserved.
