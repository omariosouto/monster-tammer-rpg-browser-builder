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
import { useEditorStore } from "@/store/editorStore";
import { useProjectStore } from "@/store/projectStore";

export function PropertiesPanel() {
  const [collapsed, setCollapsed] = useState(false);
  const { selectedEntityId, selectedEntityType } = useEditorStore();
  const { project } = useProjectStore();

  const currentMap = project?.maps[0];

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
                  readOnly
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

          {/* Entity Properties */}
          {selectedEntityId && selectedEntityType && (
            <section>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                {selectedEntityType === "npc" ? "NPC" : "Event"}
              </h3>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="entity-name" className="text-xs">
                    Name
                  </Label>
                  <Input
                    id="entity-name"
                    className="h-8 text-xs"
                    placeholder="Entity name"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="entity-x" className="text-xs">
                      X
                    </Label>
                    <Input
                      id="entity-x"
                      type="number"
                      className="h-8 text-xs"
                      value={0}
                      readOnly
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="entity-y" className="text-xs">
                      Y
                    </Label>
                    <Input
                      id="entity-y"
                      type="number"
                      className="h-8 text-xs"
                      value={0}
                      readOnly
                    />
                  </div>
                </div>
                {selectedEntityType === "npc" && (
                  <div className="space-y-1">
                    <Label htmlFor="npc-direction" className="text-xs">
                      Direction
                    </Label>
                    <Select defaultValue="down">
                      <SelectTrigger id="npc-direction" className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="up">Up</SelectItem>
                        <SelectItem value="down">Down</SelectItem>
                        <SelectItem value="left">Left</SelectItem>
                        <SelectItem value="right">Right</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
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
