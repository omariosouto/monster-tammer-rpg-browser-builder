# ADR-002: UI Framework - Tailwind CSS v4 + shadcn/ui

## Status
Accepted

## Context
The map editor requires a comprehensive UI with panels, toolbars, dialogs, and various form controls. We need a styling solution that is flexible, performant, and provides good DX. The editor is desktop-only, so mobile responsiveness is not a priority for UI components.

## Decision
- **CSS Framework**: Tailwind CSS v4 - Utility-first CSS with new v4 features
- **Component Library**: shadcn/ui - Accessible, customizable components built on Radix UI
- **Biome CSS**: Disabled CSS linting/formatting in Biome (Tailwind v4 syntax not fully supported)

## Components Added
- Button, Dialog, Select, Tabs, Input, Label
- ScrollArea, Separator, Tooltip, DropdownMenu

## Consequences
### Positive
- Rapid UI development with utility classes
- Accessible components out of the box (Radix UI)
- Full control over component styling
- Dark mode support built-in
- Small bundle size (only used components are included)

### Negative
- Need to disable Biome CSS parsing for Tailwind v4 syntax
- Component customization requires understanding Tailwind

## References
- Issue #2: Configure Tailwind CSS and shadcn/ui
