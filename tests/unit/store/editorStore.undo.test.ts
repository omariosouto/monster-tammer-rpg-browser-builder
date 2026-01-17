import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { useEditorStore, type HistoryEntry } from "@/store/editorStore";

describe("editorStore undo/redo", () => {
  beforeEach(() => {
    act(() => {
      useEditorStore.getState().resetEditor();
    });
  });

  afterEach(() => {
    act(() => {
      useEditorStore.getState().resetEditor();
    });
  });

  describe("history management", () => {
    it("should start with empty history", () => {
      const { result } = renderHook(() => useEditorStore());
      expect(result.current.history).toHaveLength(0);
      expect(result.current.historyIndex).toBe(-1);
    });

    it("should push history entries", () => {
      const entry: HistoryEntry = {
        type: "tile",
        mapId: "map-1",
        layerId: "layer-1",
        changes: [{ x: 0, y: 0, oldTileId: 0, newTileId: 1 }],
      };

      act(() => {
        useEditorStore.getState().pushHistory(entry);
      });

      const state = useEditorStore.getState();
      expect(state.history).toHaveLength(1);
      expect(state.historyIndex).toBe(0);
      expect(state.history[0]).toEqual(entry);
    });

    it("should limit history to 50 entries", () => {
      act(() => {
        for (let i = 0; i < 60; i++) {
          useEditorStore.getState().pushHistory({
            type: "tile",
            mapId: "map-1",
            layerId: "layer-1",
            changes: [{ x: i, y: 0, oldTileId: 0, newTileId: 1 }],
          });
        }
      });

      const state = useEditorStore.getState();
      expect(state.history).toHaveLength(50);
      expect(state.historyIndex).toBe(49);
    });

    it("should discard redo stack when pushing new entry", () => {
      act(() => {
        // Push 3 entries
        for (let i = 0; i < 3; i++) {
          useEditorStore.getState().pushHistory({
            type: "tile",
            mapId: "map-1",
            layerId: "layer-1",
            changes: [{ x: i, y: 0, oldTileId: 0, newTileId: i + 1 }],
          });
        }
        // Undo twice
        useEditorStore.getState().undo();
        useEditorStore.getState().undo();
      });

      // Should be at index 0 with 3 entries
      let state = useEditorStore.getState();
      expect(state.historyIndex).toBe(0);
      expect(state.history).toHaveLength(3);

      // Push new entry - should discard entries at index 1 and 2
      act(() => {
        useEditorStore.getState().pushHistory({
          type: "tile",
          mapId: "map-1",
          layerId: "layer-1",
          changes: [{ x: 99, y: 0, oldTileId: 0, newTileId: 99 }],
        });
      });

      state = useEditorStore.getState();
      expect(state.history).toHaveLength(2);
      expect(state.historyIndex).toBe(1);
    });
  });

  describe("undo", () => {
    it("should return null when nothing to undo", () => {
      const result = useEditorStore.getState().undo();
      expect(result).toBeNull();
    });

    it("should return the entry and decrement index", () => {
      const entry: HistoryEntry = {
        type: "tile",
        mapId: "map-1",
        layerId: "layer-1",
        changes: [{ x: 0, y: 0, oldTileId: 0, newTileId: 1 }],
      };

      act(() => {
        useEditorStore.getState().pushHistory(entry);
      });

      let result: HistoryEntry | null = null;
      act(() => {
        result = useEditorStore.getState().undo();
      });

      expect(result).toEqual(entry);
      expect(useEditorStore.getState().historyIndex).toBe(-1);
    });

    it("canUndo should return correct value", () => {
      expect(useEditorStore.getState().canUndo()).toBe(false);

      act(() => {
        useEditorStore.getState().pushHistory({
          type: "tile",
          mapId: "map-1",
          layerId: "layer-1",
          changes: [{ x: 0, y: 0, oldTileId: 0, newTileId: 1 }],
        });
      });

      expect(useEditorStore.getState().canUndo()).toBe(true);

      act(() => {
        useEditorStore.getState().undo();
      });

      expect(useEditorStore.getState().canUndo()).toBe(false);
    });
  });

  describe("redo", () => {
    it("should return null when nothing to redo", () => {
      const result = useEditorStore.getState().redo();
      expect(result).toBeNull();
    });

    it("should return the entry and increment index", () => {
      const entry: HistoryEntry = {
        type: "tile",
        mapId: "map-1",
        layerId: "layer-1",
        changes: [{ x: 0, y: 0, oldTileId: 0, newTileId: 1 }],
      };

      act(() => {
        useEditorStore.getState().pushHistory(entry);
        useEditorStore.getState().undo();
      });

      let result: HistoryEntry | null = null;
      act(() => {
        result = useEditorStore.getState().redo();
      });

      expect(result).toEqual(entry);
      expect(useEditorStore.getState().historyIndex).toBe(0);
    });

    it("canRedo should return correct value", () => {
      expect(useEditorStore.getState().canRedo()).toBe(false);

      act(() => {
        useEditorStore.getState().pushHistory({
          type: "tile",
          mapId: "map-1",
          layerId: "layer-1",
          changes: [{ x: 0, y: 0, oldTileId: 0, newTileId: 1 }],
        });
      });

      expect(useEditorStore.getState().canRedo()).toBe(false);

      act(() => {
        useEditorStore.getState().undo();
      });

      expect(useEditorStore.getState().canRedo()).toBe(true);

      act(() => {
        useEditorStore.getState().redo();
      });

      expect(useEditorStore.getState().canRedo()).toBe(false);
    });
  });

  describe("history entry types", () => {
    it("should handle layer_add entries", () => {
      const entry: HistoryEntry = {
        type: "layer_add",
        mapId: "map-1",
        layerId: "new-layer-id",
      };

      act(() => {
        useEditorStore.getState().pushHistory(entry);
      });

      const state = useEditorStore.getState();
      expect(state.history[0].type).toBe("layer_add");
    });

    it("should handle layer_delete entries", () => {
      const entry: HistoryEntry = {
        type: "layer_delete",
        mapId: "map-1",
        layerData: {
          id: "deleted-layer",
          name: "Layer 1",
          type: "ground",
          visible: true,
          opacity: 1,
          data: [0, 0, 0],
        },
        index: 0,
      };

      act(() => {
        useEditorStore.getState().pushHistory(entry);
      });

      const state = useEditorStore.getState();
      expect(state.history[0].type).toBe("layer_delete");
    });

    it("should handle layer_update entries", () => {
      const entry: HistoryEntry = {
        type: "layer_update",
        mapId: "map-1",
        layerId: "layer-1",
        oldData: { visible: true },
        newData: { visible: false },
      };

      act(() => {
        useEditorStore.getState().pushHistory(entry);
      });

      const state = useEditorStore.getState();
      expect(state.history[0].type).toBe("layer_update");
    });
  });
});
