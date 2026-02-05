# Spinnarr - AI Development Guidelines

## Project Overview

Spinnarr is a React + TypeScript web app for multi-stage random selection (spinner wheels). Users upload JSON configs defining multiple spinners, navigate through them sequentially, and view aggregated results. Deployed as a static site via Docker/nginx.

## Architecture & Data Flow

### State Management Pattern

- **Single source of truth**: [src/App.tsx](../src/App.tsx) manages collection-level state (spinners array, current index, results map)
- **Component props**: Individual `<Spinner>` components receive items array and callbacks
- **No external state library**: Uses React hooks (`useState`, `useCallback`, `useMemo`) throughout

### Key State Flow

1. JSON file loaded → validated via [src/utils/validation.ts](../src/utils/validation.ts) type guards
2. `CollectionConfig` split into `SpinnerConfig[]` array in App state
3. Navigate through spinners sequentially (index-based, not router)
4. Results stored in `Record<number, string>` keyed by spinner index
5. Final spinner → show aggregated results view

### Critical Data Structure

```typescript
// Defined in src/types.ts
interface CollectionConfig {
  title?: string;
  spinners: SpinnerConfig[]; // Must have ≥1 spinner
}

interface SpinnerConfig {
  name: string; // Non-empty required
  items: string[]; // Non-empty required
}
```

Validation enforces these constraints in [src/utils/validation.ts](../src/utils/validation.ts) - any JSON upload failing validation shows alert referencing [schema.json](../schema.json).

## Project-Specific Conventions

### Type Safety Patterns

- **Type guards over type assertions**: Use `isCollectionConfig(data)`, `isTheme(value)` predicates
- **Type imports**: Always use `import type` for types/interfaces (enforced by ESLint rule `@typescript-eslint/consistent-type-imports`)
- **Unknown → validated**: External data starts as `unknown`, validated to typed objects

### Color Generation

The [src/utils/spinner.ts](../src/utils/spinner.ts) `generateAccessibleColors()` function is non-trivial:

- Generates HSL colors with WCAG AA contrast (4.5:1 ratio) against black text
- Distributes hues evenly across color wheel for N items
- Randomizes saturation/lightness within constrained range
- Accepts optional `random` parameter for deterministic testing

### Audio Implementation

Audio is **procedurally generated** using Web Audio API, not loaded files:

- [src/components/Spinner.tsx](../src/components/Spinner.tsx) generates noise buffer in `useEffect`
- Tick sounds triggered on segment boundary crossings during animation
- Pitch randomization (0.9-1.1×) for natural variation
- Mute state controlled by user toggle

### Haptics Integration

- Vibration API wrapped in [src/utils/haptics.ts](../src/utils/haptics.ts) with typed patterns
- Used at: spin start (`medium`), segment ticks (`tick`), completion (`success` in future)
- Gracefully degrades in browsers/devices without support

### Spinner Physics

- **Easing**: `easeOutQuart` (quartic ease-out) for realistic deceleration
- **Anti-divider logic**: `nudgeAwayFromDivider()` prevents results landing on segment boundaries by detecting proximity (default 2° threshold) and adjusting ±2.5°
- **Winning calculation**: Rotation normalized to 0-360°, divided by segment angle, floored to index

## Development Workflows

### Commands (Strict Order Matters)

```bash
npm run lint       # Runs typecheck THEN eslint (exit on first fail)
npm run lint:fix   # Auto-fixes ESLint issues only
npm run test       # Vitest (unit tests in tests/ directory)
npm run build      # TypeScript build + Vite bundle (checks types first)
npm run dev        # Local server on :5173
npm run preview    # Build + serve production bundle
```

**Critical**: `npm run lint` runs `tsc -b` first (via `npm run typecheck`), then ESLint. Fix type errors before lint errors.

### Node Version

- **Required**: Node.js 22.12.0+ (v22.x only, not v23)
- Use `nvm use` to activate correct version from `.nvmrc` (if present) or check [package.json](../package.json) engines field

### Docker Build

- Production build uses multi-stage Dockerfile (Node builder → nginx runtime)
- Environment variable `VITE_DEFAULT_SPINNER_FILE` set at build time (not runtime!)
- Custom configs can be volume-mounted to `/usr/share/nginx/html/public` in container

## Testing Patterns

### Utility Testing Focus

- Tests in [tests/](../tests/) cover **pure functions** in `src/utils/` (spinner.ts, validation.ts)
- No React component tests (no @testing-library setup currently)
- Use deterministic `random()` parameter in tests: `generateAccessibleColors(6, () => 0.25)`

### Example Pattern

```typescript
// Pass seeded random for reproducible color generation
const colors = generateAccessibleColors(6, () => 0.25);
```

## ESLint Configuration

Uses flat config ([eslint.config.js](../eslint.config.js)) with TypeScript type-aware rules:

- **Type-checking enabled**: `recommendedTypeChecked` with `projectService` parser
- **Key rule**: `@typescript-eslint/consistent-type-imports` enforces `import type` syntax
- **Disabled**: `react-hooks/immutability` and `react-hooks/purity` (too strict for this project)
- Ignores: `dist/` and `eslint.config.js` itself

## File Organization

### Component Structure

- [src/components/](../src/components/): Self-contained React components (Header, Spinner, FileUpload, ThemeToggle)
- [src/utils/](../src/utils/): Pure utility functions (testable, no React dependencies)
- [src/styles/](../src/styles/): CSS modules (App.css, index.css)

### Key Files

- [schema.json](../schema.json): JSON schema for user-uploaded configs (referenced in error messages)
- [public/Minecraft-House-Builder.json](../public/Minecraft-House-Builder.json): Default example loaded if `VITE_DEFAULT_SPINNER_FILE` env var set
- [src/types.ts](../src/types.ts): All TypeScript interfaces/types (centralized, no inline types)

## Common Gotchas

1. **State reset on file upload**: `resetCollection()` clears ALL state including mute/audio - intentional UX decision
2. **Animation cleanup**: Always check `animationRef.current !== null` before canceling frame
3. **Segment angle validation**: Check `segmentAngle > 0` before division (handles empty items array)
4. **Type guard usage**: Never `as` cast external JSON - always validate with `isCollectionConfig()` first
5. **Audio context state**: Must resume from `suspended` state before playing (browser autoplay policies)

## Deployment Notes

- Static site (no backend) - all logic client-side
- Nginx serves built assets from `/usr/share/nginx/html`
- Default config loaded from public path (compile-time env var, not runtime)
- Custom configs: users upload files at runtime (no server persistence)
