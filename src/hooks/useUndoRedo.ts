import { useCallback, useEffect } from "react";
import { type HistoryEntry, useEditorStore } from "@/store/editorStore";
import { useProjectStore } from "@/store/projectStore";

/**
 * Hook that handles undo/redo operations and keyboard shortcuts
 */
export function useUndoRedo() {
  const { undo, redo, canUndo, canRedo, selectEntity } = useEditorStore();
  const {
    setTiles,
    addLayer,
    deleteLayer,
    updateLayer,
    getMap,
    addNPC,
    deleteNPC,
    addEvent,
    deleteEvent,
  } = useProjectStore();

  // Apply the inverse of a history entry (for undo)
  const applyUndo = useCallback(
    (entry: HistoryEntry) => {
      switch (entry.type) {
        case "tile": {
          // Restore old tile values
          const tiles = entry.changes.map((change) => ({
            x: change.x,
            y: change.y,
            tileId: change.oldTileId,
          }));
          setTiles(entry.mapId, entry.layerId, tiles);
          break;
        }
        case "layer_add": {
          // Remove the layer that was added
          deleteLayer(entry.mapId, entry.layerId);
          break;
        }
        case "layer_delete": {
          // Re-add the layer that was deleted
          // Note: This adds it at the end, not at original position
          addLayer(entry.mapId, entry.layerData);
          break;
        }
        case "layer_update": {
          // Restore old layer data
          updateLayer(entry.mapId, entry.layerId, entry.oldData);
          break;
        }
        case "npc_add": {
          // Remove the NPC that was added
          deleteNPC(entry.mapId, entry.npcData.id);
          selectEntity(null, null);
          break;
        }
        case "npc_delete": {
          // Re-add the NPC that was deleted
          addNPC(entry.mapId, entry.npcData);
          break;
        }
        case "event_add": {
          // Remove the Event that was added
          deleteEvent(entry.mapId, entry.eventData.id);
          selectEntity(null, null);
          break;
        }
        case "event_delete": {
          // Re-add the Event that was deleted
          addEvent(entry.mapId, entry.eventData);
          break;
        }
      }
    },
    [
      setTiles,
      deleteLayer,
      addLayer,
      updateLayer,
      deleteNPC,
      addNPC,
      deleteEvent,
      addEvent,
      selectEntity,
    ],
  );

  // Apply a history entry (for redo)
  const applyRedo = useCallback(
    (entry: HistoryEntry) => {
      switch (entry.type) {
        case "tile": {
          // Apply new tile values
          const tiles = entry.changes.map((change) => ({
            x: change.x,
            y: change.y,
            tileId: change.newTileId,
          }));
          setTiles(entry.mapId, entry.layerId, tiles);
          break;
        }
        case "layer_add": {
          // Re-add the layer
          const map = getMap(entry.mapId);
          if (map) {
            const newLayer = {
              id: entry.layerId,
              name: `Layer ${map.layers.length + 1}`,
              type: "object" as const,
              visible: true,
              opacity: 1,
              data: new Array(map.width * map.height).fill(0),
            };
            addLayer(entry.mapId, newLayer);
          }
          break;
        }
        case "layer_delete": {
          // Delete the layer again
          deleteLayer(entry.mapId, entry.layerData.id);
          break;
        }
        case "layer_update": {
          // Apply new layer data
          updateLayer(entry.mapId, entry.layerId, entry.newData);
          break;
        }
        case "npc_add": {
          // Re-add the NPC
          addNPC(entry.mapId, entry.npcData);
          break;
        }
        case "npc_delete": {
          // Delete the NPC again
          deleteNPC(entry.mapId, entry.npcData.id);
          selectEntity(null, null);
          break;
        }
        case "event_add": {
          // Re-add the Event
          addEvent(entry.mapId, entry.eventData);
          break;
        }
        case "event_delete": {
          // Delete the Event again
          deleteEvent(entry.mapId, entry.eventData.id);
          selectEntity(null, null);
          break;
        }
      }
    },
    [
      setTiles,
      addLayer,
      deleteLayer,
      updateLayer,
      getMap,
      addNPC,
      deleteNPC,
      addEvent,
      deleteEvent,
      selectEntity,
    ],
  );

  // Handle undo action
  const handleUndo = useCallback(() => {
    if (!canUndo()) return;
    const entry = undo();
    if (entry) {
      applyUndo(entry);
    }
  }, [canUndo, undo, applyUndo]);

  // Handle redo action
  const handleRedo = useCallback(() => {
    if (!canRedo()) return;
    const entry = redo();
    if (entry) {
      applyRedo(entry);
    }
  }, [canRedo, redo, applyRedo]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl+Z (Windows/Linux) or Cmd+Z (Mac)
      const isMod = e.ctrlKey || e.metaKey;

      if (isMod && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if (isMod && e.key === "z" && e.shiftKey) {
        // Ctrl+Shift+Z for redo
        e.preventDefault();
        handleRedo();
      } else if (isMod && e.key === "y") {
        // Ctrl+Y for redo (alternative)
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleUndo, handleRedo]);

  return {
    handleUndo,
    handleRedo,
    canUndo: canUndo(),
    canRedo: canRedo(),
  };
}
