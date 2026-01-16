import { Application, extend } from "@pixi/react";
import { Container, Graphics, Sprite, Text } from "pixi.js";
import { useCallback } from "react";

// Extend PixiJS components for React
extend({ Container, Graphics, Sprite, Text });

interface GameCanvasProps {
  width?: number;
  height?: number;
}

export function GameCanvas({ width = 480, height = 320 }: GameCanvasProps) {
  // Draw a simple grid pattern to test rendering
  const drawGrid = useCallback(
    (g: Graphics) => {
      g.clear();

      const tileSize = 16;
      const cols = Math.ceil(width / tileSize);
      const rows = Math.ceil(height / tileSize);

      // Draw checkerboard pattern (like GBA tile grid)
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const isEven = (row + col) % 2 === 0;
          g.rect(col * tileSize, row * tileSize, tileSize, tileSize);
          g.fill(isEven ? 0x2a2a3a : 0x1a1a2a);
        }
      }

      // Draw grid lines
      g.setStrokeStyle({ width: 1, color: 0x3a3a4a, alpha: 0.5 });
      for (let x = 0; x <= width; x += tileSize) {
        g.moveTo(x, 0);
        g.lineTo(x, height);
      }
      for (let y = 0; y <= height; y += tileSize) {
        g.moveTo(0, y);
        g.lineTo(width, y);
      }
      g.stroke();
    },
    [width, height],
  );

  return (
    <Application
      width={width}
      height={height}
      backgroundColor={0x1a1a2a}
      antialias={false}
      resolution={1}
    >
      <pixiContainer>
        <pixiGraphics draw={drawGrid} />
        <pixiText
          text="PixiJS v8 Ready!"
          x={width / 2}
          y={height / 2}
          anchor={0.5}
          style={{
            fontFamily: "monospace",
            fontSize: 16,
            fill: 0xffffff,
          }}
        />
      </pixiContainer>
    </Application>
  );
}
