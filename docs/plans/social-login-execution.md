# Social Login - Execution Trace

## Routing

- Mode: LARGE `WORK` under GODMYTHOS v10.2.
- Prompt caveat: `social-login.txt` referenced GovernLedger, but the user clarified that GovernLedger should be disregarded. Scope was adapted to LeanForge Keyword Trend Index.
- InsForge skill used because the implementation writes app code using `@insforge/sdk` auth.
- Recon exception: `graphify` is not installed in this shell, so targeted recon was used.

## Scope

Implement Google and Apple social login for the LeanForge frontend using InsForge OAuth, without adding a custom token/session layer.

## Execution Trace

```yaml
execution_trace:
  - step: 1
    label: "Install @insforge/sdk in leanforge-frontend"
    state: COMPLETED
    checkpoint: true
    validation: "npm install @insforge/sdk@^1.0.0 completed"
  - step: 2
    label: "Add InsForge client and auth context"
    state: COMPLETED
    checkpoint: true
    validation: "npx tsc --noEmit passed"
  - step: 3
    label: "Add sign-in and auth callback routes"
    state: COMPLETED
    checkpoint: true
    validation: "next build prerendered /sign-in and /auth/callback"
  - step: 4
    label: "Wire header account state and sign out"
    state: COMPLETED
    checkpoint: false
    validation: "npx tsc --noEmit passed"
  - step: 5
    label: "Update environment example and policy copy"
    state: COMPLETED
    checkpoint: false
    validation: "npm run build passed"
  - step: 6
    label: "Run final validation"
    state: COMPLETED
    checkpoint: false
    validation: "npx tsc --noEmit passed; npm run build passed; npm run lint blocked by interactive Next ESLint setup prompt; npm audit --audit-level=high found pre-existing Next/ESLint chain advisories requiring breaking upgrades"
outcome: SUCCESS_WITH_LINT_SETUP_GAP
```

## Validation

- `npx.cmd tsc --noEmit`: passed.
- `npm.cmd run build`: passed.
- `npm.cmd run lint`: blocked by interactive Next.js ESLint setup prompt because the project does not have ESLint configured.
- `npm.cmd audit --audit-level=high`: failed. Advisories affect `next`, `postcss`, `glob`, and `minimatch` through Next/ESLint dependency chains. npm's high-confidence fix path includes breaking upgrades, so this was recorded as a follow-up risk instead of forced inside the auth slice.

## Operational Follow-Up

Configure these variables in the frontend environment:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_INSFORGE_URL`
- `NEXT_PUBLIC_INSFORGE_ANON_KEY`

In the InsForge auth provider settings, enable Google and Apple and set the app redirect URL to:

- `${NEXT_PUBLIC_SITE_URL}/auth/callback`

OAuth provider callbacks should point at the InsForge backend callback URL for each provider, not the frontend callback route.
