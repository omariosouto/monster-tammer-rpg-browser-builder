import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { useEditorStore } from "@/store/editorStore";
import {
  type NPCBehavior,
  type NPCDirection,
  useProjectStore,
} from "@/store/projectStore";

const NPC_SPRITE_WIDTH = 16;
const NPC_SPRITE_HEIGHT = 24;

const AVAILABLE_SPRITES = [
  { id: "npc-1", name: "NPC 1", path: "/assets/sprites/npcs/npc-1.png" },
  { id: "npc-2", name: "NPC 2", path: "/assets/sprites/npcs/npc-2.png" },
  { id: "npc-3", name: "NPC 3", path: "/assets/sprites/npcs/npc-3.png" },
  {
    id: "player",
    name: "Player",
    path: "/assets/sprites/characters/player.png",
  },
];

const DIRECTIONS: { value: NPCDirection; label: string }[] = [
  { value: "down", label: "Down" },
  { value: "up", label: "Up" },
  { value: "left", label: "Left" },
  { value: "right", label: "Right" },
];

const BEHAVIORS: { value: NPCBehavior; label: string; description: string }[] =
  [
    { value: "stationary", label: "Stationary", description: "Stays in place" },
    { value: "random", label: "Random", description: "Wanders randomly" },
    { value: "patrol", label: "Patrol", description: "Follows a path" },
  ];

export function PropertiesPanel() {
  const [collapsed, setCollapsed] = useState(false);
  const { selectedEntityId, selectedEntityType, currentMapId } =
    useEditorStore();
  const { project, updateNPC, updateMap } = useProjectStore();

  const currentMap = currentMapId
    ? project?.maps.find((m) => m.id === currentMapId)
    : project?.maps[0];

  // Get selected NPC
  const selectedNpc =
    selectedEntityType === "npc" && selectedEntityId
      ? currentMap?.npcs.find((n) => n.id === selectedEntityId)
      : null;

  // Get direction row for sprite preview (0=down, 1=left, 2=right, 3=up)
  const getDirectionRow = (direction: NPCDirection) => {
    switch (direction) {
      case "down":
        return 0;
      case "left":
        return 1;
      case "right":
        return 2;
      case "up":
        return 3;
      default:
        return 0;
    }
  };

  // Handle NPC property updates
  const handleUpdateNpc = (
    updates: Partial<{
      name: string;
      spritesheet: string;
      direction: NPCDirection;
      behavior: NPCBehavior;
      movementSpeed: number;
    }>,
  ) => {
    if (!currentMap || !selectedEntityId) return;
    updateNPC(currentMap.id, selectedEntityId, updates);
  };

  // Handle map property updates
  const handleUpdateMap = (updates: Partial<{ name: string }>) => {
    if (!currentMap) return;
    updateMap(currentMap.id, updates);
  };

  if (collapsed) {
    return (
      <aside className="w-8 border-l bg-background flex flex-col items-center py-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => setCollapsed(false)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </aside>
    );
  }

  const spriteInfo = AVAILABLE_SPRITES.find(
    (s) => s.id === selectedNpc?.spritesheet,
  );

  return (
    <aside className="w-64 border-l bg-background flex flex-col">
      {/* Header */}
      <div className="h-10 flex items-center justify-between px-3 border-b">
        <span className="text-sm font-medium">Properties</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => setCollapsed(true)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-4">
          {/* Map Properties */}
          <section>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Map
            </h3>
            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="map-name" className="text-xs">
                  Name
                </Label>
                <Input
                  id="map-name"
                  className="h-8 text-xs"
                  value={currentMap?.name ?? ""}
                  onChange={(e) => handleUpdateMap({ name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="map-width" className="text-xs">
                    Width
                  </Label>
                  <Input
                    id="map-width"
                    type="number"
                    className="h-8 text-xs"
                    value={currentMap?.width ?? 20}
                    readOnly
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="map-height" className="text-xs">
                    Height
                  </Label>
                  <Input
                    id="map-height"
                    type="number"
                    className="h-8 text-xs"
                    value={currentMap?.height ?? 15}
                    readOnly
                  />
                </div>
              </div>
            </div>
          </section>

          <Separator />

          {/* NPC Properties */}
          {selectedNpc && (
            <section>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                NPC
              </h3>
              <div className="space-y-4">
                {/* Sprite Preview */}
                <div className="flex flex-col items-center gap-2 p-3 bg-muted/50 rounded-md">
                  <div
                    className="border border-border rounded shadow-sm"
                    style={{
                      width: NPC_SPRITE_WIDTH * 3,
                      height: NPC_SPRITE_HEIGHT * 3,
                      backgroundImage: spriteInfo
                        ? `url(${spriteInfo.path})`
                        : undefined,
                      backgroundPosition: `-0px -${getDirectionRow(selectedNpc.direction) * NPC_SPRITE_HEIGHT * 3}px`,
                      backgroundSize: `${NPC_SPRITE_WIDTH * 4 * 3}px auto`,
                      imageRendering: "pixelated",
                      backgroundColor: spriteInfo ? undefined : "#666",
                    }}
                  />
                  <span className="text-xs text-muted-foreground">
                    {selectedNpc.name}
                  </span>
                </div>

                {/* Name */}
                <div className="space-y-1">
                  <Label htmlFor="npc-name" className="text-xs">
                    Name
                  </Label>
                  <Input
                    id="npc-name"
                    className="h-8 text-xs"
                    value={selectedNpc.name}
                    onChange={(e) => handleUpdateNpc({ name: e.target.value })}
                  />
                </div>

                {/* Position (read-only) */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="npc-x" className="text-xs">
                      X
                    </Label>
                    <Input
                      id="npc-x"
                      type="number"
                      className="h-8 text-xs"
                      value={selectedNpc.position.x}
                      readOnly
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="npc-y" className="text-xs">
                      Y
                    </Label>
                    <Input
                      id="npc-y"
                      type="number"
                      className="h-8 text-xs"
                      value={selectedNpc.position.y}
                      readOnly
                    />
                  </div>
                </div>

                {/* Sprite Selector */}
                <div className="space-y-1">
                  <Label htmlFor="npc-sprite" className="text-xs">
                    Sprite
                  </Label>
                  <Select
                    value={selectedNpc.spritesheet}
                    onValueChange={(value) =>
                      handleUpdateNpc({ spritesheet: value })
                    }
                  >
                    <SelectTrigger id="npc-sprite" className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AVAILABLE_SPRITES.map((sprite) => (
                        <SelectItem key={sprite.id} value={sprite.id}>
                          {sprite.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Direction Selector */}
                <div className="space-y-1">
                  <Label htmlFor="npc-direction" className="text-xs">
                    Direction
                  </Label>
                  <Select
                    value={selectedNpc.direction}
                    onValueChange={(value: NPCDirection) =>
                      handleUpdateNpc({ direction: value })
                    }
                  >
                    <SelectTrigger id="npc-direction" className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DIRECTIONS.map((dir) => (
                        <SelectItem key={dir.value} value={dir.value}>
                          {dir.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Behavior Type */}
                <div className="space-y-1">
                  <Label htmlFor="npc-behavior" className="text-xs">
                    Behavior
                  </Label>
                  <Select
                    value={selectedNpc.behavior}
                    onValueChange={(value: NPCBehavior) =>
                      handleUpdateNpc({ behavior: value })
                    }
                  >
                    <SelectTrigger id="npc-behavior" className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BEHAVIORS.map((b) => (
                        <SelectItem key={b.value} value={b.value}>
                          <div className="flex flex-col">
                            <span>{b.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    {
                      BEHAVIORS.find((b) => b.value === selectedNpc.behavior)
                        ?.description
                    }
                  </p>
                </div>

                {/* Movement Speed Slider */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="npc-speed" className="text-xs">
                      Movement Speed
                    </Label>
                    <span className="text-xs text-muted-foreground">
                      {selectedNpc.movementSpeed}
                    </span>
                  </div>
                  <Slider
                    id="npc-speed"
                    min={1}
                    max={5}
                    step={1}
                    value={[selectedNpc.movementSpeed]}
                    onValueChange={(value) =>
                      handleUpdateNpc({ movementSpeed: value[0] })
                    }
                    disabled={selectedNpc.behavior === "stationary"}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Slow</span>
                    <span>Fast</span>
                  </div>
                </div>
              </div>
            </section>
          )}

          {!selectedEntityId && (
            <p className="text-xs text-muted-foreground text-center py-4">
              Select an entity to view its properties
            </p>
          )}
        </div>
      </ScrollArea>
    </aside>
  );
}
