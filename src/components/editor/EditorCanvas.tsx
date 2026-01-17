import { useCallback, useEffect, useRef, useState } from "react";
import { type HistoryEntry, useEditorStore } from "@/store/editorStore";
import { type EventTrigger, useProjectStore } from "@/store/projectStore";

const TILE_SIZE = 16;
const TILESET_COLUMNS = 8;
const NPC_SPRITE_WIDTH = 16;
const NPC_SPRITE_HEIGHT = 24;

export function EditorCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tilesetImage, setTilesetImage] = useState<HTMLImageElement | null>(
    null,
  );
  const [npcSprites, setNpcSprites] = useState<Map<string, HTMLImageElement>>(
    new Map(),
  );

  const {
    zoom,
    gridVisible,
    activeLayerId,
    activeTool,
    selectedTiles,
    selectedEntityId,
    selectEntity,
    pushHistory,
  } = useEditorStore();
  const {
    project,
    setTile,
    getTileAt,
    addNPC,
    updateNPC,
    deleteNPC,
    addEvent,
    updateEvent,
    deleteEvent,
  } = useProjectStore();

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

  // Load NPC sprites
  useEffect(() => {
    const spriteUrls = [
      { id: "npc-1", url: "/assets/sprites/npcs/npc-1.png" },
      { id: "npc-2", url: "/assets/sprites/npcs/npc-2.png" },
      { id: "npc-3", url: "/assets/sprites/npcs/npc-3.png" },
      { id: "player", url: "/assets/sprites/characters/player.png" },
    ];

    const loadedSprites = new Map<string, HTMLImageElement>();
    let loadedCount = 0;

    for (const { id, url } of spriteUrls) {
      const img = new Image();
      img.onload = () => {
        loadedSprites.set(id, img);
        loadedCount++;
        if (loadedCount === spriteUrls.length) {
          setNpcSprites(new Map(loadedSprites));
        }
      };
      img.onerror = () => {
        loadedCount++;
        if (loadedCount === spriteUrls.length) {
          setNpcSprites(new Map(loadedSprites));
        }
      };
      img.src = url;
    }
  }, []);

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

    // Draw NPCs
    if (currentMap) {
      for (const npc of currentMap.npcs) {
        const spriteId = npc.spritesheet || "npc-1";
        const sprite = npcSprites.get(spriteId);

        const npcX = npc.position.x * scaledTileSize;
        // Offset Y so NPC stands on the tile (sprite is taller than tile)
        const npcY =
          npc.position.y * scaledTileSize -
          (NPC_SPRITE_HEIGHT - TILE_SIZE) * zoom;

        if (sprite) {
          // Get direction frame (row 0=down, 1=left, 2=right, 3=up)
          const directionRow =
            npc.direction === "down"
              ? 0
              : npc.direction === "left"
                ? 1
                : npc.direction === "right"
                  ? 2
                  : 3;

          ctx.drawImage(
            sprite,
            0, // First frame
            directionRow * NPC_SPRITE_HEIGHT,
            NPC_SPRITE_WIDTH,
            NPC_SPRITE_HEIGHT,
            npcX,
            npcY,
            NPC_SPRITE_WIDTH * zoom,
            NPC_SPRITE_HEIGHT * zoom,
          );
        } else {
          // Fallback: draw a colored rectangle
          ctx.fillStyle = "#ff6b6b";
          ctx.fillRect(npcX, npcY, scaledTileSize, NPC_SPRITE_HEIGHT * zoom);
        }

        // Draw selection indicator
        if (selectedEntityId === npc.id) {
          ctx.strokeStyle = "#00ff00";
          ctx.lineWidth = 2;
          ctx.strokeRect(
            npcX - 2,
            npcY - 2,
            NPC_SPRITE_WIDTH * zoom + 4,
            NPC_SPRITE_HEIGHT * zoom + 4,
          );
        }

        // Draw direction indicator (small arrow)
        ctx.fillStyle = "#ffffff";
        const arrowSize = 4 * zoom;
        const centerX = npcX + (NPC_SPRITE_WIDTH * zoom) / 2;
        const bottomY = npc.position.y * scaledTileSize + scaledTileSize;

        ctx.beginPath();
        if (npc.direction === "down") {
          ctx.moveTo(centerX, bottomY + arrowSize);
          ctx.lineTo(centerX - arrowSize, bottomY);
          ctx.lineTo(centerX + arrowSize, bottomY);
        } else if (npc.direction === "up") {
          ctx.moveTo(centerX, npcY - arrowSize);
          ctx.lineTo(centerX - arrowSize, npcY);
          ctx.lineTo(centerX + arrowSize, npcY);
        } else if (npc.direction === "left") {
          ctx.moveTo(npcX - arrowSize, npcY + (NPC_SPRITE_HEIGHT * zoom) / 2);
          ctx.lineTo(npcX, npcY + (NPC_SPRITE_HEIGHT * zoom) / 2 - arrowSize);
          ctx.lineTo(npcX, npcY + (NPC_SPRITE_HEIGHT * zoom) / 2 + arrowSize);
        } else {
          ctx.moveTo(
            npcX + NPC_SPRITE_WIDTH * zoom + arrowSize,
            npcY + (NPC_SPRITE_HEIGHT * zoom) / 2,
          );
          ctx.lineTo(
            npcX + NPC_SPRITE_WIDTH * zoom,
            npcY + (NPC_SPRITE_HEIGHT * zoom) / 2 - arrowSize,
          );
          ctx.lineTo(
            npcX + NPC_SPRITE_WIDTH * zoom,
            npcY + (NPC_SPRITE_HEIGHT * zoom) / 2 + arrowSize,
          );
        }
        ctx.closePath();
        ctx.fill();
      }

      // Draw Events
      for (const event of currentMap.events) {
        const eventX = event.position.x * scaledTileSize;
        const eventY = event.position.y * scaledTileSize;
        const eventWidth = event.width * scaledTileSize;
        const eventHeight = event.height * scaledTileSize;

        // Draw semi-transparent event zone
        ctx.fillStyle = "rgba(255, 200, 0, 0.3)";
        ctx.fillRect(eventX, eventY, eventWidth, eventHeight);

        // Draw border
        const isSelected = selectedEntityId === event.id;
        ctx.strokeStyle = isSelected ? "#00ff00" : "rgba(255, 200, 0, 0.8)";
        ctx.lineWidth = isSelected ? 2 : 1;
        ctx.strokeRect(eventX, eventY, eventWidth, eventHeight);

        // Draw trigger icon in center
        ctx.fillStyle = isSelected ? "#00ff00" : "#ffcc00";
        const iconSize = Math.min(scaledTileSize * 0.6, 16);
        const iconX = eventX + eventWidth / 2;
        const iconY = eventY + eventHeight / 2;

        // Draw lightning bolt icon
        ctx.beginPath();
        ctx.moveTo(iconX + iconSize * 0.1, iconY - iconSize * 0.4);
        ctx.lineTo(iconX - iconSize * 0.2, iconY);
        ctx.lineTo(iconX + iconSize * 0.1, iconY);
        ctx.lineTo(iconX - iconSize * 0.1, iconY + iconSize * 0.4);
        ctx.lineTo(iconX + iconSize * 0.2, iconY);
        ctx.lineTo(iconX - iconSize * 0.1, iconY);
        ctx.closePath();
        ctx.fill();

        // Draw resize handles if selected
        if (isSelected) {
          const handleSize = 6;
          ctx.fillStyle = "#00ff00";

          // SE handle (bottom-right)
          ctx.fillRect(
            eventX + eventWidth - handleSize / 2,
            eventY + eventHeight - handleSize / 2,
            handleSize,
            handleSize,
          );
        }

        // Draw event name
        ctx.fillStyle = isSelected ? "#00ff00" : "#ffcc00";
        ctx.font = `${Math.max(10, scaledTileSize * 0.4)}px sans-serif`;
        ctx.textAlign = "center";
        ctx.fillText(event.name, iconX, eventY - 4);
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
    npcSprites,
    selectedEntityId,
    zoom,
  ]);

  // Track if mouse is being dragged for continuous painting
  const isPaintingRef = useRef(false);
  const lastPaintedTileRef = useRef<{ x: number; y: number } | null>(null);
  // Track tile changes during a paint stroke for undo/redo
  const strokeChangesRef = useRef<
    Array<{ x: number; y: number; oldTileId: number; newTileId: number }>
  >([]);
  // Track NPC dragging
  const isDraggingNpcRef = useRef(false);
  const draggingNpcIdRef = useRef<string | null>(null);
  // Track Event dragging and resizing
  const isDraggingEventRef = useRef(false);
  const isResizingEventRef = useRef(false);
  const draggingEventIdRef = useRef<string | null>(null);
  const resizeHandleRef = useRef<"se" | "sw" | "ne" | "nw" | null>(null);
  const eventDragStartRef = useRef<{ x: number; y: number } | null>(null);

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

  // Paint or erase at the given coordinates and track the change
  const paintAtCoords = useCallback(
    (x: number, y: number) => {
      if (!currentMap || !activeLayerId) return;

      const newTileId =
        activeTool === "paint" && selectedTiles.length > 0
          ? selectedTiles[0]
          : activeTool === "erase"
            ? 0
            : null;

      if (newTileId === null) return;

      // Get the old tile value before changing
      const oldTileId = getTileAt(currentMap.id, activeLayerId, x, y);

      // Don't record if tile is already the same
      if (oldTileId === newTileId) return;

      // Record the change for undo
      strokeChangesRef.current.push({ x, y, oldTileId, newTileId });

      // Apply the change
      setTile(currentMap.id, activeLayerId, x, y, newTileId);
    },
    [currentMap, activeLayerId, activeTool, selectedTiles, setTile, getTileAt],
  );

  // Commit stroke changes to history
  const commitStroke = useCallback(() => {
    if (strokeChangesRef.current.length > 0 && currentMap && activeLayerId) {
      const historyEntry: HistoryEntry = {
        type: "tile",
        mapId: currentMap.id,
        layerId: activeLayerId,
        changes: [...strokeChangesRef.current],
      };
      pushHistory(historyEntry);
    }
    strokeChangesRef.current = [];
  }, [currentMap, activeLayerId, pushHistory]);

  // Find NPC at tile coordinates
  const findNpcAtPosition = useCallback(
    (x: number, y: number) => {
      if (!currentMap) return null;
      return currentMap.npcs.find(
        (npc) => npc.position.x === x && npc.position.y === y,
      );
    },
    [currentMap],
  );

  // Place a new NPC at coordinates
  const placeNpc = useCallback(
    (x: number, y: number) => {
      if (!currentMap) return;

      // Don't place if there's already an NPC here
      if (findNpcAtPosition(x, y)) return;

      const newNpc = {
        id: crypto.randomUUID(),
        name: `NPC ${currentMap.npcs.length + 1}`,
        position: { x, y },
        spritesheet: "npc-1",
        direction: "down" as const,
        behavior: "stationary" as const,
        movementSpeed: 2,
      };

      addNPC(currentMap.id, newNpc);
      selectEntity(newNpc.id, "npc");

      // Push history entry for undo
      pushHistory({
        type: "npc_add",
        mapId: currentMap.id,
        npcData: newNpc,
      });
    },
    [currentMap, addNPC, selectEntity, findNpcAtPosition, pushHistory],
  );

  // Find Event at tile coordinates
  const findEventAtPosition = useCallback(
    (x: number, y: number) => {
      if (!currentMap) return null;
      return currentMap.events.find(
        (event) =>
          x >= event.position.x &&
          x < event.position.x + event.width &&
          y >= event.position.y &&
          y < event.position.y + event.height,
      );
    },
    [currentMap],
  );

  // Check if click is on resize handle (only for events larger than 1x1)
  const isOnResizeHandle = useCallback(
    (
      x: number,
      y: number,
      event: {
        position: { x: number; y: number };
        width: number;
        height: number;
      },
    ) => {
      // Only show resize handle for events larger than 1x1
      if (event.width <= 1 && event.height <= 1) return false;
      const handleX = event.position.x + event.width - 1;
      const handleY = event.position.y + event.height - 1;
      return x === handleX && y === handleY;
    },
    [],
  );

  // Place a new Event at coordinates
  const placeEvent = useCallback(
    (x: number, y: number) => {
      if (!currentMap) return;

      const newEvent = {
        id: crypto.randomUUID(),
        name: `Event ${currentMap.events.length + 1}`,
        position: { x, y },
        width: 1,
        height: 1,
        trigger: "action" as EventTrigger,
      };

      addEvent(currentMap.id, newEvent);
      selectEntity(newEvent.id, "event");

      // Push history entry for undo
      pushHistory({
        type: "event_add",
        mapId: currentMap.id,
        eventData: newEvent,
      });
    },
    [currentMap, addEvent, selectEntity, pushHistory],
  );

  // Handle mouse down
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getTileCoords(e);
    if (!coords) return;

    // NPC tool: place or select NPC
    if (activeTool === "npc") {
      const existingNpc = findNpcAtPosition(coords.x, coords.y);
      if (existingNpc) {
        // Select existing NPC and start dragging
        selectEntity(existingNpc.id, "npc");
        isDraggingNpcRef.current = true;
        draggingNpcIdRef.current = existingNpc.id;
      } else {
        // Place new NPC
        placeNpc(coords.x, coords.y);
      }
      return;
    }

    // Event tool: place or select Event
    if (activeTool === "event") {
      const existingEvent = findEventAtPosition(coords.x, coords.y);
      if (existingEvent) {
        // Check if clicking on resize handle
        if (isOnResizeHandle(coords.x, coords.y, existingEvent)) {
          selectEntity(existingEvent.id, "event");
          isResizingEventRef.current = true;
          draggingEventIdRef.current = existingEvent.id;
          resizeHandleRef.current = "se";
        } else {
          // Select existing Event and start dragging
          selectEntity(existingEvent.id, "event");
          isDraggingEventRef.current = true;
          draggingEventIdRef.current = existingEvent.id;
          eventDragStartRef.current = {
            x: coords.x - existingEvent.position.x,
            y: coords.y - existingEvent.position.y,
          };
        }
      } else {
        // Place new Event
        placeEvent(coords.x, coords.y);
      }
      return;
    }

    // Select tool: select NPC or Event if clicked on one
    if (activeTool === "select") {
      // Check for Event first (they can be larger)
      const existingEvent = findEventAtPosition(coords.x, coords.y);
      if (existingEvent) {
        // Check if clicking on resize handle of selected event
        if (
          selectedEntityId === existingEvent.id &&
          isOnResizeHandle(coords.x, coords.y, existingEvent)
        ) {
          isResizingEventRef.current = true;
          draggingEventIdRef.current = existingEvent.id;
          resizeHandleRef.current = "se";
        } else {
          selectEntity(existingEvent.id, "event");
          isDraggingEventRef.current = true;
          draggingEventIdRef.current = existingEvent.id;
          eventDragStartRef.current = {
            x: coords.x - existingEvent.position.x,
            y: coords.y - existingEvent.position.y,
          };
        }
        return;
      }

      const existingNpc = findNpcAtPosition(coords.x, coords.y);
      if (existingNpc) {
        selectEntity(existingNpc.id, "npc");
        isDraggingNpcRef.current = true;
        draggingNpcIdRef.current = existingNpc.id;
        return;
      }

      selectEntity(null, null);
      return;
    }

    // Paint/erase tools
    if (activeTool === "paint" || activeTool === "erase") {
      isPaintingRef.current = true;
      lastPaintedTileRef.current = coords;
      strokeChangesRef.current = [];
      paintAtCoords(coords.x, coords.y);
    }
  };

  // Handle mouse move
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getTileCoords(e);
    if (!coords) return;

    // Handle NPC dragging
    if (isDraggingNpcRef.current && draggingNpcIdRef.current && currentMap) {
      // Don't move if there's already an NPC at the target position
      const existingNpc = findNpcAtPosition(coords.x, coords.y);
      if (!existingNpc || existingNpc.id === draggingNpcIdRef.current) {
        updateNPC(currentMap.id, draggingNpcIdRef.current, {
          position: { x: coords.x, y: coords.y },
        });
      }
      return;
    }

    // Handle Event resizing
    if (
      isResizingEventRef.current &&
      draggingEventIdRef.current &&
      currentMap
    ) {
      const event = currentMap.events.find(
        (e) => e.id === draggingEventIdRef.current,
      );
      if (event) {
        const newWidth = Math.max(1, coords.x - event.position.x + 1);
        const newHeight = Math.max(1, coords.y - event.position.y + 1);
        updateEvent(currentMap.id, draggingEventIdRef.current, {
          width: newWidth,
          height: newHeight,
        });
      }
      return;
    }

    // Handle Event dragging
    if (
      isDraggingEventRef.current &&
      draggingEventIdRef.current &&
      currentMap
    ) {
      const event = currentMap.events.find(
        (e) => e.id === draggingEventIdRef.current,
      );
      if (event && eventDragStartRef.current) {
        const newX = Math.max(
          0,
          Math.min(
            mapWidth - event.width,
            coords.x - eventDragStartRef.current.x,
          ),
        );
        const newY = Math.max(
          0,
          Math.min(
            mapHeight - event.height,
            coords.y - eventDragStartRef.current.y,
          ),
        );
        updateEvent(currentMap.id, draggingEventIdRef.current, {
          position: { x: newX, y: newY },
        });
      }
      return;
    }

    // Handle tile painting
    if (!isPaintingRef.current) return;
    if (activeTool !== "paint" && activeTool !== "erase") return;

    const last = lastPaintedTileRef.current;
    if (last && last.x === coords.x && last.y === coords.y) return;

    lastPaintedTileRef.current = coords;
    paintAtCoords(coords.x, coords.y);
  };

  // Handle mouse up
  const handleMouseUp = () => {
    if (isPaintingRef.current) {
      commitStroke();
    }
    isPaintingRef.current = false;
    lastPaintedTileRef.current = null;
    isDraggingNpcRef.current = false;
    draggingNpcIdRef.current = null;
    isDraggingEventRef.current = false;
    isResizingEventRef.current = false;
    draggingEventIdRef.current = null;
    resizeHandleRef.current = null;
    eventDragStartRef.current = null;
  };

  // Handle mouse leave
  const handleMouseLeave = () => {
    if (isPaintingRef.current) {
      commitStroke();
    }
    isPaintingRef.current = false;
    lastPaintedTileRef.current = null;
    isDraggingNpcRef.current = false;
    draggingNpcIdRef.current = null;
    isDraggingEventRef.current = false;
    isResizingEventRef.current = false;
    draggingEventIdRef.current = null;
    resizeHandleRef.current = null;
    eventDragStartRef.current = null;
  };

  // Handle keyboard for entity deletion
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === "Delete" || e.key === "Backspace") &&
        selectedEntityId &&
        currentMap
      ) {
        // Find if this is an NPC
        const npc = currentMap.npcs.find((n) => n.id === selectedEntityId);
        if (npc) {
          // Push history entry before deleting
          pushHistory({
            type: "npc_delete",
            mapId: currentMap.id,
            npcData: { ...npc },
          });
          deleteNPC(currentMap.id, selectedEntityId);
          selectEntity(null, null);
          return;
        }

        // Find if this is an Event
        const event = currentMap.events.find(
          (ev) => ev.id === selectedEntityId,
        );
        if (event) {
          // Push history entry before deleting
          pushHistory({
            type: "event_delete",
            mapId: currentMap.id,
            eventData: { ...event },
          });
          deleteEvent(currentMap.id, selectedEntityId);
          selectEntity(null, null);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    selectedEntityId,
    currentMap,
    deleteNPC,
    deleteEvent,
    selectEntity,
    pushHistory,
  ]);

  // Get cursor style based on active tool
  const getCursorStyle = () => {
    switch (activeTool) {
      case "npc":
      case "event":
        return "copy";
      case "select":
        return "default";
      case "paint":
      case "erase":
        return "crosshair";
      default:
        return "crosshair";
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
        className="border border-border shadow-lg"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        style={{
          imageRendering: "pixelated",
          cursor: getCursorStyle(),
        }}
      />
    </div>
  );
}
