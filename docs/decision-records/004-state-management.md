# ADR-004: State Management - Zustand + TanStack Query

## Status
Accepted

## Context
The application needs state management for:
1. Editor UI state (tools, selection, zoom, history)
2. Game runtime state (player position, switches, variables, dialog)
3. Project data (maps, tilesets, NPCs, events)

We also need to handle async operations like file loading/saving.

## Decision
- **Local State**: Zustand - Lightweight, TypeScript-first, no boilerplate
- **Async State**: TanStack Query (React Query) - For file operations and caching
- **Persistence**: Zustand persist middleware for game save state

## Store Architecture

### editorStore
- Active tool, selected layer/tiles
- Zoom level, grid visibility
- Undo/redo history
- No persistence (session only)

### gameStore
- Player position, direction
- Game switches and variables
- Dialog state
- Persisted to localStorage for save/load

### projectStore
- Project metadata
- Maps, tilesets, NPCs, events
- isDirty flag for unsaved changes
- No persistence (explicit export/import)

## Consequences
### Positive
- Minimal boilerplate compared to Redux
- Easy TypeScript integration
- Selective persistence
- TanStack Query handles loading states and caching
- Small bundle size

### Negative
- Less structured than Redux
- No built-in devtools (can use zustand devtools middleware)

## References
- Issue #4: Set up Zustand stores
