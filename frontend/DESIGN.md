# Frontend Surface & Depth Notes

## Sunken & Raised Surface Pattern

Use this pattern when a control or container should feel recessed into the page or card (`bg-landing-canvas` / `bg-landing-card`) with tactile depth, paired with raised inner elements (keycaps, pills, active tabs).

### CSS Tokens (`src/index.css`)

Defined for both `:root` (light) and `.dark` (dark):

- **Sunken well** (`.shadow-landing-sunken`):
  - `--landing-input-bg`: subtle vertical gradient slightly darker/recessed than `--landing-card`.
  - `--landing-input-shadow`: top inner shadow + hairline inner rim + subtle bottom lip highlight.
- **Raised keycap / badge** (`.shadow-landing-kbd`):
  - `--landing-kbd-bg`: subtle vertical gradient slightly lighter than the sunken well.
  - `--landing-kbd-shadow`: top specular highlight (`inset 0 1px 0`) + hairline rim + soft drop shadow.
- **Raised card** (`SurfaceCard` / `.shadow-landing-card`):
  - `--landing-card-bg`: subtle vertical gradient slightly lighter at the top.
  - `--landing-card-shadow`: soft top-edge highlight (`inset 0 1px 0`) + hairline bevel + soft drop shadow, used by `SurfaceCard`, `KpiCard`, and section cards.
- **Raised surface button & active nav** (`.shadow-landing-raised`):
  - `--landing-raised-bg`: top-to-bottom vertical gradient lighter at the top.
  - `--landing-raised-shadow`: bright top-edge catchlight (`inset 0 1px 0`) + hairline bevel + layered drop shadow, used by `SurfaceButton` and active sidebar items.

### Tailwind v4 / shadcn/ui Usage Rules

1. **Avoid utility overrides from `components/ui/*`**:
   - shadcn primitives like `Input` (`bg-secondary dark:bg-input/30`) and `SelectTrigger` (`bg-card shadow-xs border-input`) apply Tailwind utility classes that override `@layer base` rules and compete with custom classes in `tailwind-merge`.
   - Always keep `.shadow-landing-sunken` and `.shadow-landing-kbd` in `@layer utilities` in `src/index.css`.
   - When applying `.shadow-landing-sunken` to a shadcn primitive (such as `SelectTrigger`), pass `border-0 bg-transparent shadow-none` so `tailwind-merge` strips the default `border-input`, `bg-card`, and `shadow-xs` classes.
   - For text inputs with leading icons or trailing `<kbd>` badges, prefer a `<div className="shadow-landing-sunken ...">` wrapper with a plain `<input className="bg-transparent ...">` inside, and use `focus-within:ring-1 focus-within:ring-landing-ink-muted`.

2. **Where to apply**:
   - Search inputs (with `Search` icon + `.shadow-landing-kbd` shortcut keycap)
   - Select triggers (`SelectTrigger` with `shadow-landing-sunken border-0 bg-transparent shadow-none`)
   - Recessed filter tracks, segmented control wells, or inline command triggers
