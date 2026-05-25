# Web Stack Reference
## GODMYTHOS v9 Reference

> Framework selection, architecture patterns, and stack comparisons for web projects.

---

## Stack Selection Matrix

| Requirement | Recommended Stack | Rationale |
|-------------|-------------------|-----------|
| Solo dev, ship fast | Next.js + Prisma + PostgreSQL + Vercel | Minimal config, full-stack in one framework |
| Team, enterprise | Next.js/Remix + tRPC + PostgreSQL + Docker | Type-safe API, reproducible environments |
| High performance API | Go (Chi) + PostgreSQL + Redis | Low latency, minimal resource usage |
| Systems programming | Rust (Axum/Actix) + PostgreSQL | Memory safety, extreme performance |
| Python data/ML backend | FastAPI + SQLAlchemy + PostgreSQL | Async, Pydantic validation, ML ecosystem |
| Real-time features | Next.js + WebSocket (Socket.io or native) + Redis pub/sub | Bi-directional communication |
| Static content heavy | Astro or Next.js static export | Minimal JS shipped, fast page loads |
| Self-hosted (homelab) | Any + Docker Compose + Coolify | Coolify handles deployment, SSL, reverse proxy |

---

## Frontend Frameworks

| Framework | Best For | Avoid When |
|-----------|----------|------------|
| **Next.js 14 (App Router)** | Full-stack apps, SSR/SSG, API routes | Simple SPA with no SEO needs |
| **React (Vite)** | SPAs, dashboards, complex client state | Need SSR/SEO out of box |
| **Remix** | Data-heavy apps, nested routing, progressive enhancement | You need extensive client-side state |
| **Astro** | Content sites, blogs, documentation | Heavy client-side interactivity |
| **Svelte/SvelteKit** | Performance-critical UIs, smaller bundles | Large team (smaller ecosystem) |
| **Vue/Nuxt** | Gradual adoption, template-centric teams | You're already deep in React |

---

## Backend Frameworks

| Framework | Language | Best For | Latency Profile |
|-----------|----------|----------|-----------------|
| **Next.js API Routes** | TypeScript | Simple APIs co-located with frontend | Medium (cold starts on serverless) |
| **tRPC** | TypeScript | Type-safe full-stack with Next.js/Remix | Medium |
| **FastAPI** | Python | ML/data backends, rapid prototyping | Medium |
| **Express** | TypeScript | Maximum middleware ecosystem | Medium |
| **Chi** | Go | High-throughput APIs | Low |
| **Axum** | Rust | Extreme performance requirements | Very Low |
| **Hono** | TypeScript | Edge/serverless, lightweight | Low (edge) |

---

## Database Selection

| Database | Best For | Not For |
|----------|----------|---------|
| **PostgreSQL** | Everything (default choice) | Embedded/offline-first apps |
| **SQLite** | Embedded, local-first, CLI tools | Multi-writer concurrent access |
| **Redis** | Caching, sessions, queues, pub/sub | Primary data store |
| **MongoDB** | Document-shaped data, rapid iteration | Relational data, transactions |
| **Turso (libSQL)** | Edge-distributed SQLite | Heavy write workloads |

---

## ORM / Query Layer

| Tool | Language | Style | Best For |
|------|----------|-------|----------|
| **Prisma** | TypeScript | Schema-first ORM | Rapid development, type safety |
| **Drizzle** | TypeScript | SQL-like ORM | Performance, SQL control |
| **SQLAlchemy** | Python | Full ORM + Core | Complex queries, migrations |
| **sqlc** | Go | SQL-first codegen | Type-safe Go from raw SQL |
| **pgx** | Go | Driver | Direct PostgreSQL access |

---

## Authentication

| Solution | Best For | Self-Hosted Option |
|----------|----------|--------------------|
| **NextAuth.js / Auth.js** | Next.js apps, social login | Yes |
| **Lucia** | Lightweight, custom auth | Yes |
| **Supabase Auth** | Full-stack with Supabase | Yes (self-hosted Supabase) |
| **Clerk** | Team/enterprise with dashboard | No |
| **Custom JWT** | Full control, specific requirements | Yes |

Default recommendation: Auth.js for Next.js projects, custom JWT for API-only projects.

---

## Deployment Targets

| Target | Best For | Cost Model |
|--------|----------|------------|
| **Coolify (self-hosted)** | Homelab, full control, no vendor lock | Server cost only |
| **Vercel** | Next.js, rapid deployment | Free tier + pay per use |
| **Railway** | Quick deploys, managed infra | Pay per use |
| **Docker + VPS** | Any stack, full control | Fixed monthly |
| **Fly.io** | Edge distribution, containers | Pay per use |

---

## Architecture Patterns

### Monolith First
Start with a monolith. Extract services only when you have evidence of need
(performance bottleneck, team scaling, deployment independence). Premature
microservices are an anti-pattern.

### API Design
- REST for CRUD-heavy, public APIs
- tRPC for internal, type-safe full-stack
- GraphQL for complex, client-driven data requirements
- WebSocket for real-time features

### State Management
- Server Components + React Query for most Next.js apps
- Zustand for lightweight client state
- Jotai for atomic client state
- Redux Toolkit only if existing codebase uses Redux

---

## TypeScript Defaults

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

Always enable `strict`. No exceptions. Type assertions (`as`) require a comment explaining why.
