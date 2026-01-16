# ADR-003: Rendering Engine - PixiJS v8 with @pixi/react

## Status
Accepted

## Context
The game engine needs a performant 2D rendering system for tile-based maps, sprites, and animations. The rendering must integrate well with React for the editor UI while maintaining high performance for gameplay.

## Decision
- **Rendering Library**: PixiJS v8 - WebGL/WebGPU accelerated 2D rendering
- **React Integration**: @pixi/react - Official React bindings for PixiJS v8
- **Resolution**: GBA base resolution (240x160) with 2x scaling (480x320)
- **Pixel Art Mode**: antialias disabled, integer resolution

## Technical Details
- PixiJS components are extended for React using `extend()` from @pixi/react
- Canvas renders at 480x320 (2x GBA resolution)
- 16x16 tile size for GBA-style graphics
- Graphics API used for drawing grid/shapes
- Text rendering with monospace fonts

## Consequences
### Positive
- Hardware-accelerated rendering (WebGL/WebGPU)
- Excellent sprite batching performance
- React integration allows declarative rendering
- Good TypeScript support
- Active community and maintenance

### Negative
- Large bundle size (~600KB minified) - consider code splitting
- Learning curve for PixiJS API
- Need to manage PixiJS lifecycle with React

## Future Considerations
- Implement code splitting for PixiJS chunks
- Add sprite atlas/texture management
- Consider WebGPU renderer for modern browsers

## References
- Issue #3: Configure PixiJS v8 with @pixi/react
