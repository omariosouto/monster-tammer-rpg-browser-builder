# ADR-001: Project Setup - Vite + React + TypeScript + Biome

## Status
Accepted

## Context
We need to set up a modern React project for building a Pokémon GBA-style game builder/engine. The project needs to support TypeScript for type safety, fast development iteration, and good developer experience.

## Decision
- **Build Tool**: Vite - Fast HMR, native ESM support, excellent React integration
- **Framework**: React 19 - Latest stable version with improved performance
- **Language**: TypeScript with strict mode - Ensures type safety throughout the codebase
- **Linter/Formatter**: Biome (instead of ESLint + Prettier) - Faster, single tool for both linting and formatting
- **Path Aliases**: `@/` maps to `src/` for cleaner imports

## Consequences
### Positive
- Fast development server startup and HMR
- Single configuration for linting and formatting
- Better IDE support with strict TypeScript
- Clean import paths with aliases

### Negative
- Biome is newer and has less ecosystem support than ESLint
- Some ESLint plugins may not have Biome equivalents

## References
- Issue #1: Initialize Vite + React + TypeScript project
