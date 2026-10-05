# Contributing to BugLens

## Development Workflow

1. Pull the latest `main`
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Implement changes following the coding standards below
4. Run tests
5. Create a changeset if required: `npx changeset`
6. Commit with a meaningful message
7. Open a Pull Request

---

## Branch Naming

| Type | Pattern | Example |
|------|---------|---------|
| Feature | `feat/description` | `feat/bug-creation` |
| Fix | `fix/description` | `fix/jwt-expiry` |
| Docs | `docs/description` | `docs/api-endpoints` |
| Refactor | `refactor/description` | `refactor/bug-service` |
| Test | `test/description` | `test/bug-controller` |
| Chore | `chore/description` | `chore/update-deps` |

---

## Commit Message Style

Use conventional commits:

```
feat: add bug creation workflow
fix: validate bug severity before save
docs: update architecture diagram
test: add unit tests for bug service
refactor: extract investigation service
chore: update EF Core packages
```

---

## Coding Standards

### Backend (C#)

- Use DTOs for all API inputs/outputs — never expose EF entities directly
- Validate all inputs using FluentValidation
- Use dependency injection for all services
- Handle all exceptions in the global middleware
- Use structured logging (`ILogger<T>`)
- Never hard-code connection strings or secrets

### Frontend (TypeScript/React)

- Use TypeScript strictly — no `any`
- Use TanStack Query for server state
- Use Zustand only for client/UI state that crosses multiple components
- Use React Hook Form + Zod for all forms
- Extract reusable components to `components/`
- Prefer feature-based folder organization under `features/`

---

## Changeset Guidelines

Create a changeset when:
- A new user-facing feature is added (`minor`)
- A bug fix is shipped (`patch`)
- A breaking API/package change is introduced (`major`)

Do NOT create a changeset for:
- Internal refactors with no user-facing impact
- Documentation-only changes
- Test-only changes

```bash
npx changeset
```

---

## Testing

### Backend
```bash
cd backend/BugLens.Api.Tests
dotnet test
```

### Frontend
```bash
cd apps/web
npm run test
```

---

## Environment Setup

Copy environment files and fill in local values:

```bash
# Backend
cp backend/BugLens.Api/appsettings.Example.json backend/BugLens.Api/appsettings.Development.json

# Frontend
cp apps/web/.env.example apps/web/.env.local
```

Never commit `.env.local` or `appsettings.Development.json` with real secrets.
