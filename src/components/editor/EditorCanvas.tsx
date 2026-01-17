import { useEffect, useRef } from "react";
import { useEditorStore } from "@/store/editorStore";
import { useProjectStore } from "@/store/projectStore";

const TILE_SIZE = 16;

export function EditorCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { zoom, gridVisible, activeLayerId, activeTool, selectedTiles } =
    useEditorStore();
  const { project, setTile } = useProjectStore();

  const currentMap = project?.maps[0];
  const mapWidth = currentMap?.width ?? 20;
  const mapHeight = currentMap?.height ?? 15;

  const scaledTileSize = TILE_SIZE * zoom;
  const canvasWidth = mapWidth * scaledTileSize;
  const canvasHeight = mapHeight * scaledTileSize;

  // Draw the canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Draw background
    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw layers
    if (currentMap) {
      for (const layer of currentMap.layers) {
        if (!layer.visible) continue;

        ctx.globalAlpha = layer.opacity;

        for (let y = 0; y < mapHeight; y++) {
          for (let x = 0; x < mapWidth; x++) {
            const tileIndex = y * mapWidth + x;
            const tileId = layer.data[tileIndex];

            if (tileId > 0) {
              // Draw tile with placeholder color based on tileId
              const hue = (tileId * 37) % 360;
              ctx.fillStyle = `hsl(${hue}, 40%, 50%)`;
              ctx.fillRect(
                x * scaledTileSize,
                y * scaledTileSize,
                scaledTileSize,
                scaledTileSize,
              );
            }
          }
        }

        ctx.globalAlpha = 1;
      }
    }

    // Draw grid
    if (gridVisible) {
      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
      ctx.lineWidth = 1;

      for (let x = 0; x <= mapWidth; x++) {
        ctx.beginPath();
        ctx.moveTo(x * scaledTileSize, 0);
        ctx.lineTo(x * scaledTileSize, canvasHeight);
        ctx.stroke();
      }

      for (let y = 0; y <= mapHeight; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * scaledTileSize);
        ctx.lineTo(canvasWidth, y * scaledTileSize);
        ctx.stroke();
      }
    }
  }, [
    currentMap,
    canvasWidth,
    canvasHeight,
    mapWidth,
    mapHeight,
    scaledTileSize,
    gridVisible,
  ]);

  // Handle canvas click for painting
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!currentMap || !activeLayerId) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / scaledTileSize);
    const y = Math.floor((e.clientY - rect.top) / scaledTileSize);

    if (x < 0 || x >= mapWidth || y < 0 || y >= mapHeight) return;

    if (activeTool === "paint" && selectedTiles.length > 0) {
      setTile(currentMap.id, activeLayerId, x, y, selectedTiles[0]);
    } else if (activeTool === "erase") {
      setTile(currentMap.id, activeLayerId, x, y, 0);
    }
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center p-4 overflow-auto"
    >
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        className="border border-border shadow-lg cursor-crosshair"
        onClick={handleCanvasClick}
        style={{
          imageRendering: "pixelated",
        }}
      />
    </div>
  );
}
