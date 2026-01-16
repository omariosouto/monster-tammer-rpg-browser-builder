# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial Vite + React 19 + TypeScript project setup
- Biome for linting and formatting (replaced ESLint)
- Path aliases (`@/` for `src/`)
- Tailwind CSS v4 with Vite plugin
- shadcn/ui component library with initial components:
  - Button, Dialog, Select, Tabs, Input, Label
  - ScrollArea, Separator, Tooltip, DropdownMenu
- Decision records documentation structure
- PixiJS v8 with @pixi/react for 2D rendering
- GameCanvas component with tile grid visualization
- 480x320 canvas (2x GBA resolution)
- Zustand stores for state management:
  - editorStore: Editor UI state (tools, selection, history)
  - gameStore: Game runtime state (player, switches, variables)
  - projectStore: Project data (maps, tilesets, NPCs, events)
- TanStack Query for async state management

### Changed
- Disabled Biome CSS linting/formatting for Tailwind v4 compatibility
