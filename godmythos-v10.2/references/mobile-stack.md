# Mobile Stack Reference
## GODMYTHOS v9 Reference

> Mobile development stack guide for iOS, Android, and cross-platform.

---

## Stack Selection

| Requirement | Recommended | Rationale |
|-------------|-------------|-----------|
| Cross-platform, ship fast | React Native + Expo | Shared codebase, OTA updates, large ecosystem |
| Cross-platform, complex UI | Flutter | Widget system, smooth animations, single render engine |
| iOS only, premium feel | SwiftUI + Swift | Native performance, Apple ecosystem integration |
| Android only | Kotlin + Jetpack Compose | Modern Android, Google ecosystem |
| Web + mobile from one codebase | React Native Web + Expo | Shared logic, platform-specific UI where needed |

**Default recommendation:** React Native + Expo unless there's a concrete reason to go native.

---

## React Native + Expo Defaults

| Concern | Tool | Notes |
|---------|------|-------|
| Framework | Expo SDK (managed workflow) | Eject to bare only if native module needed |
| Navigation | Expo Router (file-based) | React Navigation under the hood |
| State | Zustand or React Query | TanStack Query for server state |
| Styling | NativeWind (Tailwind for RN) | Or StyleSheet for performance-critical |
| Auth | Expo AuthSession + Supabase | Or Auth.js mobile adapter |
| Storage | Expo SecureStore (sensitive) + MMKV (general) | Never AsyncStorage for tokens |
| Backend | Supabase or custom API | Supabase for rapid, custom for complex |
| Testing | Jest + React Native Testing Library | Detox for E2E |
| OTA Updates | Expo Updates (EAS) | Skip app store review for JS changes |

---

## Native iOS Defaults (SwiftUI)

| Concern | Tool |
|---------|------|
| UI | SwiftUI (iOS 16+ target) |
| Architecture | MVVM with Observation framework |
| Networking | URLSession + async/await |
| Persistence | SwiftData or Core Data |
| Auth | AuthenticationServices (Sign in with Apple) |
| Testing | XCTest + Swift Testing |
| CI | Xcode Cloud or Fastlane |

---

## Mobile Security Checklist

- [ ] API keys not hardcoded in app bundle (use environment config)
- [ ] Auth tokens stored in Keychain (iOS) / EncryptedSharedPreferences (Android)
- [ ] Certificate pinning for sensitive API calls
- [ ] Biometric auth for sensitive operations
- [ ] No sensitive data in app screenshots (iOS: `applicationWillResignActive`)
- [ ] Deep link validation (no open redirects)
- [ ] ProGuard/R8 obfuscation enabled (Android release builds)
- [ ] App Transport Security enabled (iOS)

---

## Performance Targets

| Metric | Target | Measure With |
|--------|--------|-------------|
| Cold start | < 2 seconds | Profiler / stopwatch |
| Navigation transition | < 300ms | React DevTools / Instruments |
| List scroll | 60 FPS | Flipper / Instruments |
| Bundle size | < 30MB (initial) | EAS build output |
| Memory | < 200MB active | Xcode Instruments / Android Profiler |

---

## Common Mobile Anti-Patterns

- Inline styles in list items (creates new objects every render)
- Heavy computation on JS thread (use `InteractionManager` or native modules)
- Unoptimized images (use Expo Image with caching)
- Missing keyboard avoidance handling
- No offline state handling
- Synchronous storage reads on startup
