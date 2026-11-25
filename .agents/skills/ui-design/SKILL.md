---
name: ui-design
description: UI and visual design standards for this repository. Activate whenever creating, editing, styling, or reviewing UI components, pages, layouts, or visual design work.
---

# UI Design Standards

Keep this skill minimal. Never include specific font names or color codes in this file.

## Components and Structure

- **Typography**: Always use typography components (such as `<Display>`, `<Title>`, etc.) to keep sizes and hierarchy consistent.
- **Buttons**: Always use fixed button components (such as primary button, secondary button, or user-specified variants) built on shadcn/ui `Button`. Create missing variants when needed; if shadcn/ui is not installed, prompt the user to install it.
- **Reusability**: Extract a reusable component whenever a pattern is repeated more than once.
- **File naming**: Use `kebab-case` when creating new component files.
- **Component placement**: Never place self-created components inside `components/ui/` (that directory is reserved for shadcn/ui). Place custom components in `components/app/` or another appropriate folder under `components/`.
- **Simplicity**: Do not overengineer designs. Keep implementations simple and intentional.

## Styling and Tokens

- **Colors**: Use only semantic color variables defined in global CSS (and theme tokens mapped to them). Never hardcode palette utilities like `text-white`, `bg-white`, `bg-black`, or raw opacity variants (`bg-white/15`, `border-white/25`). Always assume the app supports both light and dark modes (and multi-theme switching), so define light and dark values in global CSS variables. If the user introduces a new color, define it as a CSS variable first.
- **Tailwind utilities**: Avoid arbitrary Tailwind values (such as `text-[11px]` or `min-h-[600px]`) unless explicitly requested by the user. Always use the canonical Tailwind scale class (such as `text-xs` or `min-h-150`) instead, and never trigger Tailwind canonical-class warnings.
- **Favicon**: Use an SVG for the favicon. If none is available, prompt the user to provide one.

## Copy and Visual Restraint

- No filler text or filler components.
- Do not use em dashes.
- Do not use `//` or bullet symbols as decorative separators.
- Do not generate generic AI slop.
