import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useEditorStore } from "@/store/editorStore";
import { useProjectStore } from "@/store/projectStore";

// Tileset configuration from manifest
const TILE_SIZE = 16;
const TILESET_COLUMNS = 8;
const TILESET_ROWS = 8;
const TILE_COUNT = TILESET_COLUMNS * TILESET_ROWS;

// Static array of tile indices - stable for React keys
const TILE_INDICES = Array.from({ length: TILE_COUNT }, (_, i) => i);

export function TilePalette() {
  const [collapsed, setCollapsed] = useState(false);
  const {
    selectedTiles,
    selectTiles,
    selectedTilesetId,
    setSelectedTilesetId,
  } = useEditorStore();
  const { project } = useProjectStore();

  // Get tilesets from project, fallback to placeholder
  const tilesets = project?.tilesets ?? [
    {
      id: "placeholder-tileset",
      name: "Placeholder Tileset",
      image: "/assets/tilesets/placeholder-tileset.png",
    },
  ];

  // Get the currently selected tileset
  const currentTileset =
    tilesets.find((t) => t.id === selectedTilesetId) ?? tilesets[0];
  const tilesetImageUrl =
    currentTileset?.image ?? "/assets/tilesets/placeholder-tileset.png";

  // Auto-select first tileset if none selected
  useEffect(() => {
    if (!selectedTilesetId && tilesets.length > 0) {
      setSelectedTilesetId(tilesets[0].id);
    }
  }, [selectedTilesetId, tilesets, setSelectedTilesetId]);

  // Handle tile selection - select tile index + 1 (0 means empty)
  const handleTileClick = (tileIndex: number) => {
    selectTiles([tileIndex + 1]);
  };

  // Calculate background position for a tile
  const getTileBackgroundPosition = (tileIndex: number) => {
    const col = tileIndex % TILESET_COLUMNS;
    const row = Math.floor(tileIndex / TILESET_COLUMNS);
    return `-${col * TILE_SIZE}px -${row * TILE_SIZE}px`;
  };

  if (collapsed) {
    return (
      <aside className="w-8 border-r bg-background flex flex-col items-center py-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => setCollapsed(false)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </aside>
    );
  }

  return (
    <aside className="w-64 border-r bg-background flex flex-col">
      {/* Header */}
      <div className="h-10 flex items-center justify-between px-3 border-b">
        <span className="text-sm font-medium">Tiles</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => setCollapsed(true)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>

      {/* Tileset Selector */}
      <div className="p-2 border-b">
        <Select
          value={selectedTilesetId ?? undefined}
          onValueChange={setSelectedTilesetId}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="Select tileset" />
          </SelectTrigger>
          <SelectContent>
            {tilesets.map((tileset) => (
              <SelectItem key={tileset.id} value={tileset.id}>
                {tileset.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Tile Grid */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          <div className="grid grid-cols-8 gap-0.5 bg-muted/50 p-1 rounded">
            {TILE_INDICES.map((tileIndex) => (
              <button
                key={tileIndex}
                type="button"
                className={`w-6 h-6 border transition-colors ${
                  selectedTiles.includes(tileIndex + 1)
                    ? "border-primary ring-2 ring-primary"
                    : "border-transparent hover:border-muted-foreground/30"
                }`}
                style={{
                  backgroundImage: `url(${tilesetImageUrl})`,
                  backgroundPosition: getTileBackgroundPosition(tileIndex),
                  backgroundSize: `${TILESET_COLUMNS * TILE_SIZE}px ${TILESET_ROWS * TILE_SIZE}px`,
                  imageRendering: "pixelated",
                }}
                onClick={() => handleTileClick(tileIndex)}
                title={`Tile ${tileIndex + 1}`}
              />
            ))}
          </div>
        </div>
      </ScrollArea>

      {/* Selected Tile Info */}
      <div className="h-10 border-t flex items-center px-3">
        <span className="text-xs text-muted-foreground">
          {selectedTiles.length > 0
            ? `Selected: Tile ${selectedTiles.join(", ")}`
            : "Click a tile to select"}
        </span>
      </div>
    </aside>
  );
}
