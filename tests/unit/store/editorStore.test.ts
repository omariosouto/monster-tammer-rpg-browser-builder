import { act } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useEditorStore } from "@/store/editorStore";

describe("editorStore", () => {
  beforeEach(() => {
    act(() => {
      useEditorStore.getState().resetEditor();
    });
  });

  describe("initial state", () => {
    it("should have correct default values", () => {
      const state = useEditorStore.getState();

      expect(state.currentMapId).toBeNull();
      expect(state.activeTool).toBe("select");
      expect(state.activeLayerId).toBeNull();
      expect(state.selectedTilesetId).toBeNull();
      expect(state.selectedTiles).toEqual([]);
      expect(state.brushSize).toBe(1);
      expect(state.selectedEntityId).toBeNull();
      expect(state.selectedEntityType).toBeNull();
      expect(state.history).toEqual([]);
      expect(state.historyIndex).toBe(-1);
      expect(state.zoom).toBe(2);
      expect(state.gridVisible).toBe(true);
      expect(state.collisionLayerVisible).toBe(false);
    });
  });

  describe("tool selection", () => {
    it("should set active tool", () => {
      act(() => {
        useEditorStore.getState().setActiveTool("paint");
      });

      expect(useEditorStore.getState().activeTool).toBe("paint");
    });

    it("should set different tools", () => {
      const tools = [
        "select",
        "paint",
        "erase",
        "fill",
        "rectangle",
        "npc",
        "event",
        "spawn",
      ] as const;

      for (const tool of tools) {
        act(() => {
          useEditorStore.getState().setActiveTool(tool);
        });
        expect(useEditorStore.getState().activeTool).toBe(tool);
      }
    });
  });

  describe("map and layer selection", () => {
    it("should set current map id", () => {
      act(() => {
        useEditorStore.getState().setCurrentMapId("map-1");
      });

      expect(useEditorStore.getState().currentMapId).toBe("map-1");
    });

    it("should set active layer id", () => {
      act(() => {
        useEditorStore.getState().setActiveLayerId("layer-1");
      });

      expect(useEditorStore.getState().activeLayerId).toBe("layer-1");
    });

    it("should set selected tileset id", () => {
      act(() => {
        useEditorStore.getState().setSelectedTilesetId("tileset-1");
      });

      expect(useEditorStore.getState().selectedTilesetId).toBe("tileset-1");
    });
  });

  describe("tile selection", () => {
    it("should select tiles", () => {
      act(() => {
        useEditorStore.getState().selectTiles([1, 2, 3]);
      });

      expect(useEditorStore.getState().selectedTiles).toEqual([1, 2, 3]);
    });

    it("should replace previous tile selection", () => {
      act(() => {
        useEditorStore.getState().selectTiles([1, 2]);
        useEditorStore.getState().selectTiles([3, 4, 5]);
      });

      expect(useEditorStore.getState().selectedTiles).toEqual([3, 4, 5]);
    });
  });

  describe("brush size", () => {
    it("should set brush size within bounds", () => {
      act(() => {
        useEditorStore.getState().setBrushSize(3);
      });

      expect(useEditorStore.getState().brushSize).toBe(3);
    });

    it("should clamp brush size to minimum of 1", () => {
      act(() => {
        useEditorStore.getState().setBrushSize(0);
      });

      expect(useEditorStore.getState().brushSize).toBe(1);
    });

    it("should clamp brush size to maximum of 5", () => {
      act(() => {
        useEditorStore.getState().setBrushSize(10);
      });

      expect(useEditorStore.getState().brushSize).toBe(5);
    });
  });

  describe("entity selection", () => {
    it("should select NPC entity", () => {
      act(() => {
        useEditorStore.getState().selectEntity("npc-1", "npc");
      });

      const state = useEditorStore.getState();
      expect(state.selectedEntityId).toBe("npc-1");
      expect(state.selectedEntityType).toBe("npc");
    });

    it("should select event entity", () => {
      act(() => {
        useEditorStore.getState().selectEntity("event-1", "event");
      });

      const state = useEditorStore.getState();
      expect(state.selectedEntityId).toBe("event-1");
      expect(state.selectedEntityType).toBe("event");
    });

    it("should deselect entity", () => {
      act(() => {
        useEditorStore.getState().selectEntity("npc-1", "npc");
        useEditorStore.getState().selectEntity(null, null);
      });

      const state = useEditorStore.getState();
      expect(state.selectedEntityId).toBeNull();
      expect(state.selectedEntityType).toBeNull();
    });
  });

  describe("zoom", () => {
    it("should set zoom within bounds", () => {
      act(() => {
        useEditorStore.getState().setZoom(3);
      });

      expect(useEditorStore.getState().zoom).toBe(3);
    });

    it("should clamp zoom to minimum of 0.5", () => {
      act(() => {
        useEditorStore.getState().setZoom(0.1);
      });

      expect(useEditorStore.getState().zoom).toBe(0.5);
    });

    it("should clamp zoom to maximum of 4", () => {
      act(() => {
        useEditorStore.getState().setZoom(10);
      });

      expect(useEditorStore.getState().zoom).toBe(4);
    });
  });

  describe("visibility toggles", () => {
    it("should toggle grid visibility", () => {
      expect(useEditorStore.getState().gridVisible).toBe(true);

      act(() => {
        useEditorStore.getState().toggleGrid();
      });

      expect(useEditorStore.getState().gridVisible).toBe(false);

      act(() => {
        useEditorStore.getState().toggleGrid();
      });

      expect(useEditorStore.getState().gridVisible).toBe(true);
    });

    it("should toggle collision layer visibility", () => {
      expect(useEditorStore.getState().collisionLayerVisible).toBe(false);

      act(() => {
        useEditorStore.getState().toggleCollisionLayer();
      });

      expect(useEditorStore.getState().collisionLayerVisible).toBe(true);

      act(() => {
        useEditorStore.getState().toggleCollisionLayer();
      });

      expect(useEditorStore.getState().collisionLayerVisible).toBe(false);
    });
  });

  describe("history management", () => {
    it("should push history entries", () => {
      act(() => {
        useEditorStore.getState().pushHistory({
          type: "tile",
          mapId: "map-1",
          data: { x: 0, y: 0, tileId: 1 },
        });
      });

      const state = useEditorStore.getState();
      expect(state.history).toHaveLength(1);
      expect(state.historyIndex).toBe(0);
      expect(state.history[0].type).toBe("tile");
      expect(state.history[0].mapId).toBe("map-1");
    });

    it("should undo history", () => {
      act(() => {
        useEditorStore.getState().pushHistory({
          type: "tile",
          mapId: "map-1",
          data: { x: 0, y: 0, tileId: 1 },
        });
        useEditorStore.getState().pushHistory({
          type: "tile",
          mapId: "map-1",
          data: { x: 1, y: 0, tileId: 2 },
        });
      });

      expect(useEditorStore.getState().historyIndex).toBe(1);

      act(() => {
        useEditorStore.getState().undo();
      });

      expect(useEditorStore.getState().historyIndex).toBe(0);
    });

    it("should redo history", () => {
      act(() => {
        useEditorStore.getState().pushHistory({
          type: "tile",
          mapId: "map-1",
          data: { x: 0, y: 0, tileId: 1 },
        });
        useEditorStore.getState().pushHistory({
          type: "tile",
          mapId: "map-1",
          data: { x: 1, y: 0, tileId: 2 },
        });
        useEditorStore.getState().undo();
      });

      expect(useEditorStore.getState().historyIndex).toBe(0);

      act(() => {
        useEditorStore.getState().redo();
      });

      expect(useEditorStore.getState().historyIndex).toBe(1);
    });

    it("should not undo past beginning", () => {
      act(() => {
        useEditorStore.getState().undo();
      });

      expect(useEditorStore.getState().historyIndex).toBe(-1);
    });

    it("should not redo past end", () => {
      act(() => {
        useEditorStore.getState().pushHistory({
          type: "tile",
          mapId: "map-1",
          data: {},
        });
        useEditorStore.getState().redo();
      });

      expect(useEditorStore.getState().historyIndex).toBe(0);
    });

    it("should clear future history on new action after undo", () => {
      act(() => {
        useEditorStore.getState().pushHistory({
          type: "tile",
          mapId: "map-1",
          data: { action: 1 },
        });
        useEditorStore.getState().pushHistory({
          type: "tile",
          mapId: "map-1",
          data: { action: 2 },
        });
        useEditorStore.getState().pushHistory({
          type: "tile",
          mapId: "map-1",
          data: { action: 3 },
        });
        useEditorStore.getState().undo();
        useEditorStore.getState().undo();
        useEditorStore.getState().pushHistory({
          type: "tile",
          mapId: "map-1",
          data: { action: 4 },
        });
      });

      const state = useEditorStore.getState();
      expect(state.history).toHaveLength(2);
      expect(state.historyIndex).toBe(1);
    });

    it("should limit history to 50 entries", () => {
      act(() => {
        for (let i = 0; i < 60; i++) {
          useEditorStore.getState().pushHistory({
            type: "tile",
            mapId: "map-1",
            data: { index: i },
          });
        }
      });

      expect(useEditorStore.getState().history).toHaveLength(50);
    });
  });

  describe("reset", () => {
    it("should reset all state to initial values", () => {
      act(() => {
        useEditorStore.getState().setActiveTool("paint");
        useEditorStore.getState().setCurrentMapId("map-1");
        useEditorStore.getState().setZoom(3);
        useEditorStore.getState().toggleGrid();
        useEditorStore.getState().pushHistory({
          type: "tile",
          mapId: "map-1",
          data: {},
        });
      });

      act(() => {
        useEditorStore.getState().resetEditor();
      });

      const state = useEditorStore.getState();
      expect(state.activeTool).toBe("select");
      expect(state.currentMapId).toBeNull();
      expect(state.zoom).toBe(2);
      expect(state.gridVisible).toBe(true);
      expect(state.history).toEqual([]);
    });
  });
});
