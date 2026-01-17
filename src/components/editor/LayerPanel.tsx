import {
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Layers,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useEditorStore } from "@/store/editorStore";
import { useProjectStore } from "@/store/projectStore";

export function LayerPanel() {
  const [collapsed, setCollapsed] = useState(false);
  const { activeLayerId, setActiveLayerId, pushHistory } = useEditorStore();
  const { project, updateLayer, deleteLayer, addLayer } = useProjectStore();

  const currentMap = project?.maps[0];
  const layers = currentMap?.layers ?? [];

  const handleToggleVisibility = (layerId: string, visible: boolean) => {
    if (currentMap) {
      updateLayer(currentMap.id, layerId, { visible: !visible });
    }
  };

  const handleAddLayer = () => {
    if (currentMap) {
      const layerId = crypto.randomUUID();
      const newLayer = {
        id: layerId,
        name: `Layer ${layers.length + 1}`,
        type: "object" as const,
        visible: true,
        opacity: 1,
        data: new Array(currentMap.width * currentMap.height).fill(0),
      };
      addLayer(currentMap.id, newLayer);

      // Push to history for undo support
      pushHistory({
        type: "layer_add",
        mapId: currentMap.id,
        layerId,
      });
    }
  };

  const handleDeleteLayer = (layerId: string) => {
    if (currentMap && layers.length > 1) {
      // Find the layer data before deleting (for undo)
      const layerToDelete = layers.find((l) => l.id === layerId);
      const layerIndex = layers.findIndex((l) => l.id === layerId);

      if (layerToDelete) {
        // Push to history for undo support
        pushHistory({
          type: "layer_delete",
          mapId: currentMap.id,
          layerData: { ...layerToDelete },
          index: layerIndex,
        });
      }

      deleteLayer(currentMap.id, layerId);

      if (activeLayerId === layerId) {
        setActiveLayerId(
          layers[0].id === layerId ? layers[1]?.id : layers[0].id,
        );
      }
    }
  };

  if (collapsed) {
    return (
      <div className="h-8 border-t bg-background flex items-center px-3">
        <Button
          variant="ghost"
          size="sm"
          className="h-6 gap-1"
          onClick={() => setCollapsed(false)}
        >
          <Layers className="h-3 w-3" />
          <ChevronUp className="h-3 w-3" />
          <span className="text-xs">Layers</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="h-32 border-t bg-background flex flex-col">
      {/* Header */}
      <div className="h-8 flex items-center justify-between px-3 border-b">
        <Button
          variant="ghost"
          size="sm"
          className="h-6 gap-1 -ml-2"
          onClick={() => setCollapsed(true)}
        >
          <Layers className="h-3 w-3" />
          <ChevronDown className="h-3 w-3" />
          <span className="text-xs">Layers</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={handleAddLayer}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>

      {/* Layer List */}
      <ScrollArea className="flex-1">
        <div className="flex gap-1 p-2">
          {layers.map((layer) => (
            <button
              key={layer.id}
              type="button"
              className={`flex-shrink-0 w-32 p-2 rounded border transition-colors cursor-pointer text-left ${
                activeLayerId === layer.id
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-muted-foreground/50"
              }`}
              onClick={() => setActiveLayerId(layer.id)}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium truncate flex-1">
                  {layer.name}
                </span>
                <div className="flex items-center gap-0.5">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleVisibility(layer.id, layer.visible);
                    }}
                  >
                    {layer.visible ? (
                      <Eye className="h-3 w-3" />
                    ) : (
                      <EyeOff className="h-3 w-3 text-muted-foreground" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5"
                    disabled={layers.length <= 1}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteLayer(layer.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <span className="text-[10px] text-muted-foreground capitalize">
                {layer.type}
              </span>
            </button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
