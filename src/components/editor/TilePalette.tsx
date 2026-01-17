import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
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

// Static array of tile indices - stable for React keys
const TILE_INDICES = Array.from({ length: 64 }, (_, i) => i);

export function TilePalette() {
  const [collapsed, setCollapsed] = useState(false);
  const {
    selectedTiles,
    selectTiles,
    selectedTilesetId,
    setSelectedTilesetId,
  } = useEditorStore();

  // Mock tilesets for now - will be loaded from project store
  const tilesets = [{ id: "placeholder-tileset", name: "Placeholder Tileset" }];

  // Mock tile selection
  const handleTileClick = (tileIndex: number) => {
    selectTiles([tileIndex]);
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
                  selectedTiles.includes(tileIndex)
                    ? "border-primary bg-primary/20"
                    : "border-transparent hover:border-muted-foreground/30"
                }`}
                style={{
                  backgroundColor: `hsl(${(tileIndex * 5.625) % 360}, 40%, ${50 + (tileIndex % 3) * 10}%)`,
                }}
                onClick={() => handleTileClick(tileIndex)}
                title={`Tile ${tileIndex}`}
              />
            ))}
          </div>
        </div>
      </ScrollArea>

      {/* Selected Tile Info */}
      <div className="h-10 border-t flex items-center px-3">
        <span className="text-xs text-muted-foreground">
          {selectedTiles.length > 0
            ? `Selected: ${selectedTiles.join(", ")}`
            : "No tile selected"}
        </span>
      </div>
    </aside>
  );
}
