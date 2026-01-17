import { useCallback, useEffect, useRef, useState } from "react";
import { useEditorStore } from "@/store/editorStore";
import { useProjectStore } from "@/store/projectStore";

const TILE_SIZE = 16;
const TILESET_COLUMNS = 8;

export function EditorCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tilesetImage, setTilesetImage] = useState<HTMLImageElement | null>(
    null,
  );

  const { zoom, gridVisible, activeLayerId, activeTool, selectedTiles } =
    useEditorStore();
  const { project, setTile } = useProjectStore();

  // Get the current tileset
  const currentTileset = project?.tilesets[0];
  const tilesetImageUrl =
    currentTileset?.image ?? "/assets/tilesets/placeholder-tileset.png";

  // Load tileset image
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setTilesetImage(img);
    };
    img.src = tilesetImageUrl;
  }, [tilesetImageUrl]);

  const currentMap = project?.maps[0];
  const mapWidth = currentMap?.width ?? 20;
  const mapHeight = currentMap?.height ?? 15;

  const scaledTileSize = TILE_SIZE * zoom;
  const canvasWidth = mapWidth * scaledTileSize;
  const canvasHeight = mapHeight * scaledTileSize;

  // Get source coordinates for a tile from the tileset
  const getTileSourceCoords = useCallback((tileId: number) => {
    // tileId is 1-indexed (0 means empty), so subtract 1 for array index
    const tileIndex = tileId - 1;
    const col = tileIndex % TILESET_COLUMNS;
    const row = Math.floor(tileIndex / TILESET_COLUMNS);
    return {
      sx: col * TILE_SIZE,
      sy: row * TILE_SIZE,
    };
  }, []);

  // Draw the canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Disable image smoothing for pixel-perfect rendering
    ctx.imageSmoothingEnabled = false;

    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Draw background
    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw layers
    if (currentMap && tilesetImage) {
      for (const layer of currentMap.layers) {
        if (!layer.visible) continue;

        ctx.globalAlpha = layer.opacity;

        for (let y = 0; y < mapHeight; y++) {
          for (let x = 0; x < mapWidth; x++) {
            const tileIndex = y * mapWidth + x;
            const tileId = layer.data[tileIndex];

            if (tileId > 0) {
              // Get source coordinates from tileset
              const { sx, sy } = getTileSourceCoords(tileId);

              // Draw tile from tileset image
              ctx.drawImage(
                tilesetImage,
                sx,
                sy,
                TILE_SIZE,
                TILE_SIZE,
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
    tilesetImage,
    getTileSourceCoords,
  ]);

  // Track if mouse is being dragged for continuous painting
  const isPaintingRef = useRef(false);
  const lastPaintedTileRef = useRef<{ x: number; y: number } | null>(null);

  // Get tile coordinates from mouse event
  const getTileCoords = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return null;

      const rect = canvas.getBoundingClientRect();
      const x = Math.floor((e.clientX - rect.left) / scaledTileSize);
      const y = Math.floor((e.clientY - rect.top) / scaledTileSize);

      if (x < 0 || x >= mapWidth || y < 0 || y >= mapHeight) return null;
      return { x, y };
    },
    [scaledTileSize, mapWidth, mapHeight],
  );

  // Paint or erase at the given coordinates
  const paintAtCoords = useCallback(
    (x: number, y: number) => {
      if (!currentMap || !activeLayerId) return;

      if (activeTool === "paint" && selectedTiles.length > 0) {
        setTile(currentMap.id, activeLayerId, x, y, selectedTiles[0]);
      } else if (activeTool === "erase") {
        setTile(currentMap.id, activeLayerId, x, y, 0);
      }
    },
    [currentMap, activeLayerId, activeTool, selectedTiles, setTile],
  );

  // Handle mouse down - start painting
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool !== "paint" && activeTool !== "erase") return;

    const coords = getTileCoords(e);
    if (!coords) return;

    isPaintingRef.current = true;
    lastPaintedTileRef.current = coords;
    paintAtCoords(coords.x, coords.y);
  };

  // Handle mouse move - continue painting while dragging
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isPaintingRef.current) return;
    if (activeTool !== "paint" && activeTool !== "erase") return;

    const coords = getTileCoords(e);
    if (!coords) return;

    // Only paint if we moved to a different tile
    const last = lastPaintedTileRef.current;
    if (last && last.x === coords.x && last.y === coords.y) return;

    lastPaintedTileRef.current = coords;
    paintAtCoords(coords.x, coords.y);
  };

  // Handle mouse up - stop painting
  const handleMouseUp = () => {
    isPaintingRef.current = false;
    lastPaintedTileRef.current = null;
  };

  // Handle mouse leave - stop painting when cursor leaves canvas
  const handleMouseLeave = () => {
    isPaintingRef.current = false;
    lastPaintedTileRef.current = null;
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
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        style={{
          imageRendering: "pixelated",
        }}
      />
    </div>
  );
}
