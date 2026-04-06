# Senior Architect Review — TYPESET v3
**Date:** 2026-04-05
**Reviewer:** Claude (Automated)

---

## Executive Summary

TYPESET v3 is a well-structured React 18 + Vite + TypeScript SPA that has grown through rapid iterative development into a commercially deployed product. The codebase demonstrates solid fundamentals: a clean `core / features / store / components` module layout, typed Zustand slices with clear action/state separation, Stripe webhook signature verification, and meaningful test coverage at the unit level.

The most significant issues are concentrated in three areas: (1) a systemic `any`-typed boundary between Zustand's `set`/`get` and every action factory, which undermines TypeScript's ability to catch store mutations; (2) the `create-checkout` endpoint does not authenticate the caller, making it trivially exploitable by anyone who can POST with an arbitrary `userId`; and (3) all four icon libraries ship in the main bundle simultaneously, adding an estimated 300–500 kB to the initial parse cost with no lazy loading strategy.

There are no exposed client-side secrets, no obvious XSS vectors, and the share/decode pipeline degrades gracefully on malformed input. Stripe webhook signature verification is correctly implemented. RLS policies are in place for all three Supabase tables. These are genuine strengths.

---

## 1. Architecture & Structure

### Findings

**Module boundary design — good.** The project follows a three-layer separation:

- `v3/src/core/` — pure business logic, zero React imports. Color math, typography scale, spacing, export formatters, share encode/decode, and session storage all live here. This is the correct placement for anything that should be independently testable.
- `v3/src/store/` — Zustand slices that compose core logic with React-observable state.
- `v3/src/features/` — React UI organized by feature area (generator, detail, preview, export, sessions).
- `v3/src/components/` — shared UI primitives and auth shells.
- `v3/src/pages/` — route-level pages.

**Barrel export discipline — inconsistent.** `v3/src/store/index.ts` re-exports everything from all slice files and provides convenience selectors (`useColor`, `useTypography`, etc.). This is well-done. But `v3/src/core/` has no top-level barrel — consumers import directly from deep paths like `@/core/color/harmony`, `@/core/typography/scale`, etc. This is fine while the codebase is small but will become an impedance issue as the team grows.

**Feature folder depth — deep but manageable.** The `features/detail/tabs/ColorsTab/` depth of 4 levels is at the edge of comfortable navigation. Each tab contains 4–8 components. No circular dependencies were found between features.

**Legacy code accumulation.** `v3/src/core/color/harmonyLegacy.ts` and the `@deprecated` annotations on `HarmonyModelName` / `HARMONY_MODELS` in `v3/src/core/color/types.ts` (lines 3–96) indicate the old harmony model system has been superseded by the `RecipeDef` engine but the old types remain in the public API surface. `harmonyLegacy.ts` is re-exported from `harmony.ts` line 7 ("so old imports don't break at runtime"). This should be scheduled for removal.

**Duplicate `buildTokenMap` call in `ExportPanel`.** `v3/src/features/export/ExportPanel.tsx` line 59 calls `buildTokenMap(...)` directly on every render of an open panel, recomputing the full token map from raw inputs. The same computation already runs inside the Zustand subscription in `v3/src/store/index.ts` lines 91–110 and the result is cached in `_cachedTokenMap`. The export panel could read from the cache via `useColorTokens()` rather than rebuilding independently. This is a medium-priority duplication, not a correctness bug.

**`SessionsDrawer` imports Supabase client directly.** `v3/src/features/sessions/SessionsDrawer.tsx` line 6 imports `supabase` directly and passes it as an argument to `listCloudSessions`, `saveCloudSession`, etc. This is the correct pattern — it avoids module-level coupling — but the pattern is inconsistent with `DesignSystemViewer.tsx` which also imports supabase directly but doesn't pass it as a parameter (it uses it inline). Consistency would help.

### Severity: Medium

---

## 2. State Management

### Findings

**Store composition pattern is correct in intent but poorly typed.** `v3/src/store/index.ts` lines 47–48 use `(set: any, get: any)` to compose all slices. The same `any` suppression appears in every action factory: `color.ts:50`, `typography.ts:56`, `effects.ts:51`, `spacing.ts:41`, `components.ts:22`, `ui.ts:55`. This is a known Zustand limitation when manually composing slices without using the `combine` middleware or a typed creator pattern. The consequence is that every `set(...)` call inside an action bypasses TypeScript — you could `set({ typo: ... })` (wrong key) and get no error. The correct fix is to define a typed `SetState<AppStore>` alias and replace all `any` parameters with it.

**`JSON.stringify` equality check on subscriptions — performance risk.** `v3/src/store/index.ts` line 109:
```
{ equalityFn: (a, b) => JSON.stringify(a) === JSON.stringify(b) }
```
This serializes the entire derived selector object (`slots`, `pairing`, `scale`, `dataVizN`, `stateOverrides`, `spacing`, `effects`, `componentOverrides`, `theme`) on every state change to compare. For the typical palette of 4–8 color slots this is acceptable, but as the token map grows the JSON serialisation cost will scale linearly. A shallow structural equality function would be safer and faster. The `subscribeWithSelector` middleware already provides fine-grained selection — using it with `shallow` from `zustand/shallow` would eliminate the JSON cost entirely.

**`useColorTokens` selector — referential identity issue.** `v3/src/store/index.ts` lines 121–128:
```typescript
export function useColorTokens() {
  return useStore(state => {
    void state.color.slots
    void state.typography.pairing
    return _cachedTokenMap
  })
}
```
The selector returns `_cachedTokenMap`, a module-level variable, not a value from state. Zustand determines whether to trigger a re-render by comparing the previous and current return values. Since `_cachedTokenMap` is a new object reference every time the subscription fires (line 106: `_cachedTokenMap = tokens`), this will cause every consumer of `useColorTokens()` to re-render on every palette change — which is intended. However, if a component calls `useColorTokens()` purely to read stable derived tokens without caring about intermediate changes, it will re-render more than necessary. The `void` statements establish the subscription correctly, but the comment on line 122 could mislead future maintainers into thinking this is a normal selector.

**Temporal (zundo) `any` cast for undo/redo introspection.** `v3/src/store/index.ts` lines 131–134 and `AppHeader.tsx` lines 51–53 both cast `useStore as any` to access the `temporal` store. The `zundo` library exports `useTemporalStore` for exactly this purpose. Using the official API would remove two `any` casts and make the undo/redo enable/disable logic refactorable.

**UI state is excluded from zundo history.** The `partialize` config (index.ts lines 63–69) correctly excludes `ui` from the undo stack — only `color`, `typography`, `spacing`, `effects`, `components` are tracked. This is the right design decision, since undoing a tab switch would be confusing. The `limit: 50` prevents unbounded memory growth.

**`setMode('detail')` mutates multiple slices in one `set()` call.** `v3/src/store/ui.ts` lines 65–73 lock color slots, typography locks, and effects locks atomically when entering detail mode. This is a correct use of Zustand's batching, but the implementation reads the full state from `get()` which causes the action to capture a snapshot of three different slices at once. If an action from another slice fires concurrently (unlikely in React's synchronous model but theoretically possible with async middleware), this could overwrite intermediate state. A safer pattern would be to use `set(produce(...))` from immer if concurrent mutations become a concern.

**`buildSnapshot()` in `SessionsDrawer` uses a hard-coded `scaleRatio: 1.333`.** `v3/src/features/sessions/SessionsDrawer.tsx` line 50. The actual scale ratio is available in `state.typography.scale?._ratio` (as used in `ExportPanel.tsx` line 108). The hard-coded value means that users who change the scale ratio and save will have their setting silently lost on restore.

### Severity: Medium (type safety), Low (runtime correctness, except the hard-coded scaleRatio which is Medium)

---

## 3. Security

### Findings

#### 3.1 Checkout Endpoint — No Authentication (Critical)

`v3/api/create-checkout.ts` lines 9–10 accept a `userId` from the POST body:
```typescript
const { userId } = req.body as { userId?: string }
```
There is no JWT verification, no Supabase session check, no rate limiting, and no CORS restriction on this endpoint. Any unauthenticated HTTP client can POST `{"userId": "<any-valid-uuid>"}` and receive a Stripe Checkout URL pre-populated with that user's `supabase_user_id` in the session metadata. While Stripe Checkout itself will collect payment from whoever clicks the link, the real risk is that an attacker who knows a victim's Supabase UUID (which is not a secret — it is written into the URL path `/s/:username/:slug` lookups) could generate a checkout link for the victim's account. If the attacker completes the purchase, the webhook will upgrade the victim's plan, bypassing any billing intent.

More precisely: the attacker completes payment for the victim, the webhook fires `processCheckoutCompleted` with the victim's UUID, the victim's plan is set to `paid`. This is not a loss-of-access attack but it is a billing abuse vector and a fraud risk to the merchant (chargebacks on the attacker's card).

**Fix:** Verify the Supabase JWT from the `Authorization` header inside `create-checkout.ts` before creating a session, and assert that the JWT's `sub` claim matches the body's `userId`.

#### 3.2 Stripe Secret Key is a `VITE_` Prefixed Feature Flag (Low Risk, Notable)

`v3/api/create-checkout.ts` line 26 reads `process.env.VITE_EARLY_BIRD_ACTIVE`. The `VITE_` prefix convention is reserved for browser-exposed env vars (Vite embeds them into the client bundle at build time). While this specific variable is read server-side in the Vercel Function, its naming convention could mislead a future developer into placing it in the browser bundle. The `.env.example` (line 16) correctly sets it as `VITE_EARLY_BIRD_ACTIVE=true` which means this value *is* embedded in the client bundle. For a feature flag this is intentional (the frontend probably reads it too), but it means the "early bird pricing is active" flag is visible to any user who inspects the bundle. This is acceptable for a promotional flag but should be documented.

#### 3.3 Stripe Webhook — Correctly Implemented

`v3/api/stripe-webhook.ts` correctly:
- Disables Vercel's automatic body parser (`config.api.bodyParser = false`)
- Reads the raw body via streaming before calling `stripe.webhooks.constructEvent`
- Validates the `stripe-signature` header before any processing
- Uses the `SUPABASE_SERVICE_ROLE_KEY` (server-only) rather than the anon key to update `users.plan`
- Returns 200 for unknown event types to prevent unnecessary Stripe retries

No issues found in this file.

#### 3.4 Supabase Client — Correct Use of Anon Key

`v3/src/lib/supabase.ts` uses `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, both of which are intentionally public (the anon key is safe in browser code when RLS is enabled). The fail-fast `throw` on missing env vars (lines 6–9) is the right pattern.

#### 3.5 Row Level Security — Adequate with One Concern

`001_initial_schema.sql` (lines 27–28) has:
```sql
create policy "users_select_username_public" on public.users
  for select using (true);
```
This allows any authenticated or unauthenticated client to enumerate all `users` rows (id, email, username, plan). The intent is to support the `/s/:username/:slug` viewer resolving usernames to UUIDs. However, the policy also exposes the `email` column to the public. The query in `DesignSystemViewer.tsx` only selects `id`, not `email`, so the application never reads emails publicly — but the policy does not restrict the column. A Supabase column-level privilege or a policy restricted to `select (id, username)` would tighten this.

**The `plan` column is also readable by anyone** (free vs paid). This is low-sensitivity data but worth noting: a competitor could enumerate which users are paid customers.

#### 3.6 Share/Decode — Safe

`v3/src/core/share/decode.ts` correctly:
- Returns `null` if the hash does not start with `#v3/`
- Wraps the entire inflate+parse in try/catch, returning `null` on any error
- Checks `parsed.v !== 3` before returning

The decoded `ShareSnapshot` is used directly to set Zustand state (`App.tsx` lines 44–72). The types are constrained (`ColorSlot[]`, `FontPairing`, etc.) so there is no `eval()` or `innerHTML` in the restore path. No XSS vector was found.

**However:** there is no structural validation (Zod/Valibot/JSON schema) of the decoded snapshot beyond the `v !== 3` check. A crafted share URL with a malformed `colors` array (e.g., negative-length arrays, wrong types) would pass through to the store. The `generatePalette` and `buildTokenMap` functions contain no defensive guards against malformed slot data. This is a medium-risk robustness issue, not an immediate security issue, because the attacker would only affect themselves.

#### 3.7 XSS Vectors — None Found

The `DesignSystemViewer.tsx` injects font names from a decoded snapshot into `style` attributes (`fontFamily: '"${snap.pairing.heading}", sans-serif'`, line 204). If a crafted share URL contained a font name with CSS injection characters (e.g., `"Helvetica; position: fixed; top: 0"`), it would be injected via `style.fontFamily`. React's inline style prop sanitizes this for standard CSS properties, but `fontFamily` accepts arbitrary strings. This is a low-severity stored CSS injection on the viewer page, not an XSS vector (no script execution), but it warrants a server-side allowlist of font names when restoring from untrusted share data.

Similarly, `design.name` and `design.username` in `DesignSystemViewer.tsx` lines 141, 143 are rendered as text content inside JSX, so React escapes them. No raw `dangerouslySetInnerHTML` was found anywhere in the codebase.

#### 3.8 CSRF

The checkout endpoint (`/api/create-checkout`) does not include CSRF protection. Since the endpoint accepts `Content-Type: application/json`, a cross-origin form-based CSRF attack is not possible (browsers enforce CORS preflight for `application/json`). However, the lack of authentication noted in §3.1 is a more direct concern.

### Severity: Critical (3.1), Medium (3.5, 3.6), Low (3.2, 3.7)

---

## 4. Code Quality

### Findings

**`any`-typed `set`/`get` in all action factories.** As noted in §2, every action creator file uses `// eslint-disable-next-line @typescript-eslint/no-explicit-any` before the factory function signature. This is not suppressed once but in each of the six slice files. The pattern is structural; it cannot be fixed with a simple suppression — it requires a typed creator approach.

**`eslint-disable-line react-hooks/exhaustive-deps` in ExportPanel.** `v3/src/features/export/ExportPanel.tsx` line 57:
```typescript
}, [exportPanelOpen]) // eslint-disable-line react-hooks/exhaustive-deps
```
The dependency array omits `activeExportFormat`, `user`, and `setExportFormat`. The intent is clear from the comment ("If panel opens while a locked format is selected, reset to CSS"), but stale closures over `user?.plan` are possible if the user's plan changes while the panel is open. Refactoring to include all deps and guard the conditional explicitly would be safer.

**No error boundaries anywhere in the component tree.** Grep for `ErrorBoundary` returns zero results. A color computation error, a failed font load, or a corrupt snapshot restore could crash the entire application with an uncaught React render error and a blank screen. At minimum, the `LivePreview`, `ExportPanel`, and `DesignSystemViewer` should be wrapped in error boundaries with graceful fallbacks.

**No `React.lazy` / `Suspense` code splitting.** All pages, all feature panels, and all four icon libraries are imported at the top of their modules and bundled synchronously. The router in `v3/src/router.tsx` imports all pages statically. Given that the application has distinct route pages (sign-in, design viewer, account, legal), lazy loading these with `React.lazy` would meaningfully reduce initial bundle size.

**`harmonyLegacy.ts` is a dead-code accumulation point.** The file exists to keep old import paths working but all callers in the codebase already import from the new `recipes.ts` engine. A codebase-wide grep shows `harmonyLegacy` is only referenced from `harmony.ts` line 7 as a re-export, and `HarmonyModelName` is only used in `typography.ts` (for the `generate(harmonyModel?)` parameter, a legacy bridge). This should be deleted with the deprecated types.

**`buildSnapshot()` is a non-hook called inside a component.** `v3/src/features/sessions/SessionsDrawer.tsx` line 37 defines `buildSnapshot()` as a plain function that calls `useStore.getState()`. This is fine — Zustand's `getState()` is safe outside React. But the function is defined at module scope and reads from the singleton store directly without any argument. It looks like a hook but is not — naming it `snapshotFromCurrentState()` would reduce confusion.

**`handleLoad` in `SessionsDrawer` calls `typographyActions.generate()` after `setState`.** `v3/src/features/sessions/SessionsDrawer.tsx` lines 155–183. After restoring color and typography state, `generate()` is called to rebuild the type scale. This means a restored session's font pairing is preserved (from the snapshot) but the typography scale is regenerated fresh, potentially changing font sizes the user had customised. The snapshot includes `typographyLocks` but does not include `stepOverrides` — so per-step overrides are silently lost on restore.

**`DesignSystemViewer` duplicates luminance/contrast math.** `v3/src/pages/DesignSystemViewer.tsx` lines 23–44 implement WCAG 2.1 relative luminance and contrast ratio calculations from scratch. These are already implemented in `v3/src/core/color/` (the `apca-w3` package is in dependencies). Using the existing implementation would reduce the risk of subtle differences between the viewer and the main tool.

### Severity: High (no error boundaries, stale closure in ExportPanel), Medium (dead code, snapshot restore loses stepOverrides)

---

## 5. Performance

### Findings

**Four icon libraries in the main bundle — High priority.** `v3/package.json` lists all four as production `dependencies`:
- `lucide-react` ^0.577.0
- `@heroicons/react` ^2.2.0
- `@phosphor-icons/react` ^2.1.10
- `@tabler/icons-react` ^3.40.0

`v3/src/features/detail/tabs/ComponentsTab/IconLibrarySection.tsx` imports 24 icons from each of the four libraries at the top of the file (lines 1–50), making all four libraries part of the initial chunk. Lucide alone is ~1.5 MB unminified (tree-shaken to ~50–100 kB for used icons). With all four, the icon-related JS cost is likely 200–500 kB of parsed JavaScript even after tree shaking, because `IconLibrarySection` imports 24 icons from each library unconditionally.

The additional Lucide icons used throughout the app shell (`Undo2`, `Redo2`, `Bookmark`, `Sun`, `SunDim`, `Moon`, `Download`, `Lock`, `LockOpen`, `Cloud`, `HardDrive`, `X`) will be tree-shaken independently — so the app shell Lucide cost is low. But `IconLibrarySection` forces all four full icon sets into the bundle.

**Fix options (in order of impact):**
1. Move `IconLibrarySection` behind `React.lazy` so the four libraries are only loaded when the Components tab opens.
2. Reduce to a single default icon library and make the others optional peer dependencies loaded on demand.

**`buildTokenMap` runs synchronously on every state change via subscription.** The subscription at `v3/src/store/index.ts` lines 91–110 calls `buildTokenMap(...)` then `injectTokensToDOM(...)` on every change. `buildTokenMap` iterates over all slots and calls `makeShadeScale(hex)` (11-step OKLCH computation) for each slot, plus calls `deriveBrandRoles`, `deriveNeutralRoles`, `deriveStateMoodRoles`, and `deriveComponentTokens`. For 4–8 slots this is fast, but the JSON.stringify equality check (line 109) doubles the serialisation work. Memoising the per-slot shade scale computation (e.g. with a `Map<hex, ShadeScale>` cache keyed on hex) would reduce redundant computation on partial lock-and-generate cycles.

**`injectTokensToDOM` iterates all tokens on every change.** `v3/src/store/derived.ts` lines 220–245 loops over all `tokens.dark` keys then all `tokens.light` keys, calling `style.setProperty` for each. For ~200 CSS custom properties this is a non-issue in Chromium (style.setProperty is fast). It would only become a concern if the token count grew to thousands.

**No memoisation in feature components.** The grep for `React.memo`, `useMemo`, `useCallback` across `.tsx` files returned 14 occurrences, all in `SessionsDrawer.tsx` (6), `DesignSystemViewer.tsx` (2), `AuthProvider.tsx` (4), and `SplitPane.tsx` (2). No `React.memo` was found. Components like `ContrastGrid`, `ShadeScaleSection`, and `ComponentPreview` re-render on every store update because their parent tabs re-render. For a design tool where users type hex values rapidly, the lack of memoisation is noticeable. The Zustand convenience selectors (`useColor()`, `useTypography()`) return entire sub-state objects, which means any change to any color slot will re-render every component that calls `useColor()`.

**`ExportPanel` computes `buildTokenMap` on every render while open.** As noted in §1, this is a second full token map computation. The panel only needs to recompute when the underlying tokens change. The fix is to call `useColorTokens()` from the cache.

### Severity: High (icon bundle size), Medium (missing memoisation, ExportPanel double computation)

---

## 6. Type Safety

### Findings

**Pervasive `any` in action factories (17 occurrences across 6 files).** The eslint suppressions for `@typescript-eslint/no-explicit-any` appear in every store action file. This is the single largest type-safety gap. The `set` and `get` parameters of Zustand creator functions can be fully typed using:
```typescript
type Set = (partial: Partial<AppStore> | ((state: AppStore) => Partial<AppStore>)) => void
type Get = () => AppStore
```
Replacing `any` with these types would catch incorrect slice key names and wrong value shapes at compile time.

**`applyStepOverrides` uses `any` for the result object.** `v3/src/store/typography.ts` lines 44–45:
```typescript
const result: any = { ...scale }
```
The function signature correctly types inputs and output (`TypeScale`) but casts the working variable to `any`. This is unnecessary — `const result = { ...scale } as TypeScale` (or a mapped type) would maintain type safety throughout.

**`AppHeader` accesses `temporal.getState().pastStates` as `unknown[]`.** `v3/src/components/AppShell/AppHeader.tsx` lines 51–53 use `(useStore as any).temporal`. The `zundo` library exports a typed `useTemporalStore` hook. Using it would remove this cast and provide compile-time guarantees about the temporal store's shape.

**`as never` in test files.** `v3/src/auth/__tests__/AuthProvider.test.tsx` uses `as never` in mock return values (e.g. line 56: `} as never`). This is a Vitest mock typing workaround but it defeats type checking within tests. Using Vitest's `MockedFunction` or proper type overrides would make the mocks typesafe.

**`ShareSnapshot` lacks a structural validator.** The decoded snapshot from `decodeShare` is cast `as ShareSnapshot` (decode.ts line 19) without runtime validation. A Zod schema for `ShareSnapshot` would both validate and narrow the type, replacing the `as` cast with a typed parse.

**`DesignRow` interface in `cloudStorage.ts` is not exported or shared.** The inline `DesignRow` interface is used to cast Supabase query results in multiple places. Supabase's auto-generated types (`supabase gen types typescript`) would eliminate all manual casting in the database layer.

**TypeScript `strict: true` is enabled.** `v3/tsconfig.app.json` has `"strict": true`, `"noUnusedLocals": true`, `"noUnusedParameters": true`. This is a positive signal. The `any` suppressions are therefore explicit choices, not defaults. The build does compile cleanly.

### Severity: Medium (structural, not causing runtime bugs today but eroding confidence in refactors)

---

## 7. Build & Config

### Findings

**`vite.config.ts` has no build configuration.** `v3/vite.config.ts` contains only the react plugin, the `@` path alias, and Vitest configuration. There is no `build` block configuring chunk splitting, rollup output options, or asset size warnings. Vite's default chunk limit warning threshold is 500 kB. The four icon libraries likely push the main chunk above this. Adding:
```typescript
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'icon-libs': ['lucide-react', '@heroicons/react', '@phosphor-icons/react', '@tabler/icons-react'],
      }
    }
  }
}
```
would at minimum move icon library code to a separate chunk, though lazy loading `IconLibrarySection` is the more impactful fix.

**`stripe` is in `dependencies`, not `devDependencies`.** `v3/package.json` line 28 lists `"stripe": "^17.7.0"` as a production dependency. The Stripe SDK is only used in `v3/api/` (Vercel Functions), never in the browser bundle. Vite's tree shaking will prevent it from entering the client bundle since no `src/` file imports it, but placing it in `devDependencies` would make the intent explicit and reduce `node_modules` size for browser builds.

**`vercel.json` rewrite rules are redundant.** `v3/vercel.json` lines 2–5:
```json
{ "source": "/api/(.*)", "destination": "/api/$1" }
```
This rewrite maps `/api/*` to `/api/*` — a no-op. Vercel automatically routes `api/` directory files as serverless functions. The SPA fallback rewrite (`/((?!api/).*) → /index.html`) is necessary and correct.

**`tsconfig.node.json` is missing from the workspace.** The glob search found `v3/tsconfig.node.tsbuildinfo` (modified, per git status) but no `v3/tsconfig.node.json` source file in the repository listing. This suggests the file may exist but was not returned by the glob (possible case-sensitivity issue on the Windows filesystem). If absent, the tsbuildinfo file is stale. Worth verifying.

**`setupFiles: []` in Vitest config.** `v3/vite.config.ts` line 14 has an empty `setupFiles` array. Global mocks (Supabase client initialization throws on missing env vars) would crash tests that transitively import `@/lib/supabase`. Tests currently avoid this by explicitly mocking at the test file level (`vi.mock('@/lib/supabase', ...)`). A global setup file that mocks the Supabase module would be cleaner and prevent future test failures when new test files import from paths that transitively touch the Supabase client.

**API version string cast in Stripe.** Both `v3/api/create-checkout.ts` line 24 and `v3/api/stripe-webhook.ts` line 70 use:
```typescript
{ apiVersion: '2024-12-18.acacia' as Stripe.LatestApiVersion }
```
The `as Stripe.LatestApiVersion` cast is required because Stripe's SDK enforces a specific string literal type for the API version. This is a known Stripe SDK ergonomics issue, not a bug.

### Severity: Medium (build config gaps), Low (redundant rewrite, package classification)

---

## 8. Testing

### Findings

**Test coverage overview.** The test suite covers:
- `v3/src/core/color/__tests__/` — 3 files (dataViz, scales, types, harmony)
- `v3/src/core/components/__tests__/` — 3 files (icons, tokens, types)
- `v3/src/core/effects/__tests__/` — 1 file (shadows)
- `v3/src/core/export/__tests__/` — 2 files (css, figma)
- `v3/src/core/share/__tests__/` — 1 file (share encode/decode)
- `v3/src/core/spacing/__tests__/` — 1 file (scale)
- `v3/src/core/typography/__tests__/` — 1 file (scale)
- `v3/src/core/sessions/__tests__/` — 2 files (storage, cloudStorage)
- `v3/src/store/__tests__/` — 4 files (color-tokens-selector, derived-theme, effects-actions, color-recipe-actions, ui-theme)
- `v3/src/auth/__tests__/` — 1 file (AuthProvider)
- `v3/api/__tests__/` — 1 file (stripe-webhook)

This is solid unit-level coverage of core logic and the most security-sensitive backend code.

**Gaps — Integration tests are absent.** There are no tests for:
- The full `generate → buildTokenMap → injectTokensToDOM` pipeline end-to-end
- The `loadFromHash` → state restore flow in App.tsx
- The `saveCloudSession` → load → restore round-trip
- The export panel's gating logic (free vs paid format access)
- The `create-checkout` endpoint (no test file exists for it)

**`color-tokens-selector.test.ts` tests the wrong abstraction.** `v3/src/store/__tests__/color-tokens-selector.test.ts` (lines 1–13) calls `useStore.getState().colorActions.generate()` then checks `state.color.slots.length > 0`. This tests that generate populates slots, not that the token cache is populated or correct. The test name "token cache" does not match what is actually asserted.

**`AuthProvider.test.tsx` is comprehensive and well-structured.** Four scenarios are tested: initial loading state, no session, existing profile, new profile creation, and sign-out event. The mock chain for Supabase's fluent API (`.from().select().eq().single()`) is correctly set up. This is the highest-quality test in the suite.

**`stripe-webhook.test.ts` covers the business logic unit but not the HTTP handler.** The `processCheckoutCompleted` function is tested in isolation (3 scenarios). The HTTP handler (`handler`) which validates the Stripe signature is not tested. A test using `fetch` or Vercel's test utilities for the raw HTTP handler would catch signature verification regressions.

**No snapshot tests or visual regression tests.** Given the product is a design tool that generates CSS custom properties, snapshot tests on `buildTokenMap` output would be valuable regression guards. A test that asserts the full CSS output for a known input palette and configuration would catch silent token regressions introduced by changes to the color math functions.

**`vitest run --coverage` is configured but no coverage threshold is set.** `v3/package.json` includes `"test:coverage": "vitest run --coverage"` but `vite.config.ts` has no `coverage.thresholds` config. Setting minimum thresholds (e.g. 80% for `src/core/`) would prevent accidental coverage regressions during feature development.

### Severity: Medium (integration test gap, missing create-checkout test, no coverage thresholds)

---

## Security Audit (Consolidated)

| ID | Issue | Severity | File | Line |
|----|-------|----------|------|------|
| S1 | `create-checkout` endpoint has no authentication — arbitrary userId accepted | Critical | `v3/api/create-checkout.ts` | 9 |
| S2 | `users` table RLS exposes `email` and `plan` to anonymous reads | Medium | `docs/superpowers/sql/001_initial_schema.sql` | 27 |
| S3 | No structural validation on decoded ShareSnapshot — malformed share URLs accepted | Medium | `v3/src/core/share/decode.ts` | 19 |
| S4 | Font family names from share data injected into inline CSS without allowlist | Low | `v3/src/pages/DesignSystemViewer.tsx` | 204 |
| S5 | `VITE_EARLY_BIRD_ACTIVE` embedded in client bundle — minor information disclosure | Low | `v3/api/create-checkout.ts` | 26 |
| S6 | No CSRF token on checkout endpoint (mitigated by JSON Content-Type) | Low | `v3/api/create-checkout.ts` | — |

---

## Prioritized Action Items

1. **[Critical — Security] Add JWT authentication to `/api/create-checkout`.**
   Extract the Supabase JWT from the `Authorization: Bearer <token>` header, verify it using `supabase.auth.getUser(token)`, and assert that `user.id === req.body.userId` before creating the Stripe session. This closes the billing fraud vector.
   Files: `v3/api/create-checkout.ts`

2. **[High — Performance] Lazy-load `IconLibrarySection` and its four icon library imports.**
   Wrap `IconLibrarySection` with `React.lazy(() => import(...))` and a `Suspense` boundary. This defers loading of all four icon libraries (~300–500 kB) until the user opens the Components tab.
   Files: `v3/src/features/detail/tabs/ComponentsTab/ComponentsTab.tsx`, `v3/src/features/detail/tabs/ComponentsTab/IconLibrarySection.tsx`

3. **[High — Reliability] Add React error boundaries to at minimum three subtrees.**
   Wrap `<LivePreview>`, `<ExportPanel>`, and `<DesignSystemViewer>` in error boundaries with graceful fallback UI. A crash in color computation or a malformed snapshot should not white-screen the entire application.
   Files: `v3/src/App.tsx`, `v3/src/pages/DesignSystemViewer.tsx`

4. **[Medium — Type Safety] Replace `any`-typed `set`/`get` in all action factories with a typed creator pattern.**
   Define `type StoreSet = ...` and `type StoreGet = ...` in `v3/src/store/index.ts` and propagate them to all six action factory functions. Remove all `eslint-disable @typescript-eslint/no-explicit-any` suppressions from store files.
   Files: `v3/src/store/index.ts`, `v3/src/store/color.ts`, `v3/src/store/typography.ts`, `v3/src/store/effects.ts`, `v3/src/store/spacing.ts`, `v3/src/store/components.ts`, `v3/src/store/ui.ts`

5. **[Medium — Correctness] Fix `buildSnapshot()` hard-coded `scaleRatio: 1.333`.**
   Replace with `state.typography.scale?._ratio ?? 1.333`. Also include `stepOverrides` and `stepLocks` in the snapshot to preserve per-step customisations across save/restore cycles.
   Files: `v3/src/features/sessions/SessionsDrawer.tsx` line 50, `v3/src/core/share/types.ts`

6. **[Medium — Security / Robustness] Add structural validation (Zod) to `decodeShare`.**
   A `z.object({ v: z.literal(3), colors: z.array(...), ... })` schema in `v3/src/core/share/types.ts` would catch malformed share payloads before they reach the store.
   Files: `v3/src/core/share/decode.ts`, `v3/src/core/share/types.ts`

7. **[Medium — Performance] Replace `JSON.stringify` equality check in Zustand subscription with `shallow`.**
   Import `shallow` from `zustand/shallow` and replace the `equalityFn` on the token-rebuild subscription (`index.ts` line 109). This eliminates the full serialisation of the subscription selector on every state change.
   Files: `v3/src/store/index.ts`

8. **[Medium — Performance] Eliminate `ExportPanel`'s redundant `buildTokenMap` call.**
   Replace the direct `buildTokenMap(...)` call in `ExportPanel.tsx` line 59 with `useColorTokens()` to read from the Zustand-managed cache.
   Files: `v3/src/features/export/ExportPanel.tsx`

9. **[Medium — Security] Restrict the `users_select_username_public` RLS policy to only expose `id` and `username`.**
   Use a column-level SELECT policy or a VIEW that excludes `email` and `plan` from public reads.
   Files: `docs/superpowers/sql/001_initial_schema.sql` (and apply as a Supabase migration)

10. **[Medium — Testing] Add a test for the `create-checkout` HTTP handler and integration test for the `loadFromHash → restore` flow.**
    The checkout endpoint currently has no test. The `loadFromHash` flow is tested nowhere. Both are critical user paths.
    Files: `v3/api/__tests__/create-checkout.test.ts` (new), `v3/src/core/share/__tests__/share.test.ts` (extend)

11. **[Medium — Build] Move `stripe` from `dependencies` to `devDependencies` and add `manualChunks` to `vite.config.ts`.**
    Also add `build.chunkSizeWarningLimit` to surface large chunks in CI.
    Files: `v3/package.json`, `v3/vite.config.ts`

12. **[Low — Maintenance] Remove `harmonyLegacy.ts` and the deprecated `HarmonyModelName` / `HARMONY_MODELS` exports.**
    Confirm no external consumers depend on these exports (they appear to be internal only). Remove the `@deprecated` types and the re-export in `harmony.ts` line 7.
    Files: `v3/src/core/color/harmonyLegacy.ts`, `v3/src/core/color/types.ts` lines 1–96, `v3/src/core/color/harmony.ts` line 7

13. **[Low — Build] Remove the no-op rewrite from `vercel.json`.**
    The `/api/(.*)` → `/api/$1` rewrite rule is a no-op and adds noise.
    Files: `v3/vercel.json`

14. **[Low — DX] Use `useTemporalStore` from `zundo` instead of casting `useStore as any` for undo/redo state.**
    Files: `v3/src/store/index.ts` lines 131–134, `v3/src/components/AppShell/AppHeader.tsx` lines 51–53

---

## Essential Files for Understanding the Codebase

- `/v3/src/store/index.ts` — store composition, subscription pipeline, temporal undo
- `/v3/src/store/derived.ts` — `buildTokenMap` and `injectTokensToDOM` (core derived state engine)
- `/v3/src/store/color.ts` — color state shape and all color actions
- `/v3/src/core/color/harmony.ts` — palette generation engine
- `/v3/src/core/share/decode.ts` + `/v3/src/core/share/encode.ts` — URL share format
- `/v3/src/auth/AuthProvider.tsx` — authentication lifecycle
- `/v3/src/lib/supabase.ts` — Supabase client initialisation
- `/v3/api/create-checkout.ts` — Stripe checkout creation (security-critical)
- `/v3/api/stripe-webhook.ts` — Stripe webhook handler (security-critical)
- `/v3/src/core/sessions/cloudStorage.ts` — cloud save/load/publish logic
- `/v3/src/features/export/ExportPanel.tsx` — export gating and token formatting
- `/v3/src/features/sessions/SessionsDrawer.tsx` — session management UI with plan-based gating
- `/v3/src/pages/DesignSystemViewer.tsx` — public hosted design page
- `/v3/src/router.tsx` — all application routes
- `/docs/superpowers/sql/001_initial_schema.sql`, `002_designs_table.sql`, `003_versions_table.sql` — database schema and RLS policies
