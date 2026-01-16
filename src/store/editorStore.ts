import { create } from "zustand";

export type EditorTool =
  | "select"
  | "paint"
  | "erase"
  | "fill"
  | "rectangle"
  | "npc"
  | "event"
  | "spawn";

export type Direction = "up" | "down" | "left" | "right";

interface HistoryEntry {
  type: "tile" | "npc" | "event" | "layer";
  mapId: string;
  data: unknown;
  timestamp: number;
}

interface EditorState {
  // Current project/map
  currentMapId: string | null;

  // Tool state
  activeTool: EditorTool;
  activeLayerId: string | null;
  selectedTilesetId: string | null;
  selectedTiles: number[];
  brushSize: number;

  // Selection
  selectedEntityId: string | null;
  selectedEntityType: "npc" | "event" | null;

  // History (undo/redo)
  history: HistoryEntry[];
  historyIndex: number;

  // View
  zoom: number;
  gridVisible: boolean;
  collisionLayerVisible: boolean;

  // Actions
  setCurrentMapId: (mapId: string | null) => void;
  setActiveTool: (tool: EditorTool) => void;
  setActiveLayerId: (layerId: string | null) => void;
  setSelectedTilesetId: (tilesetId: string | null) => void;
  selectTiles: (tileIds: number[]) => void;
  setBrushSize: (size: number) => void;
  selectEntity: (id: string | null, type: "npc" | "event" | null) => void;
  setZoom: (zoom: number) => void;
  toggleGrid: () => void;
  toggleCollisionLayer: () => void;
  pushHistory: (entry: Omit<HistoryEntry, "timestamp">) => void;
  undo: () => void;
  redo: () => void;
  resetEditor: () => void;
}

const initialState = {
  currentMapId: null,
  activeTool: "select" as EditorTool,
  activeLayerId: null,
  selectedTilesetId: null,
  selectedTiles: [],
  brushSize: 1,
  selectedEntityId: null,
  selectedEntityType: null,
  history: [],
  historyIndex: -1,
  zoom: 2,
  gridVisible: true,
  collisionLayerVisible: false,
};

export const useEditorStore = create<EditorState>((set, get) => ({
  ...initialState,

  setCurrentMapId: (mapId) => set({ currentMapId: mapId }),

  setActiveTool: (tool) => set({ activeTool: tool }),

  setActiveLayerId: (layerId) => set({ activeLayerId: layerId }),

  setSelectedTilesetId: (tilesetId) => set({ selectedTilesetId: tilesetId }),

  selectTiles: (tileIds) => set({ selectedTiles: tileIds }),

  setBrushSize: (size) => set({ brushSize: Math.max(1, Math.min(5, size)) }),

  selectEntity: (id, type) =>
    set({ selectedEntityId: id, selectedEntityType: type }),

  setZoom: (zoom) => set({ zoom: Math.max(0.5, Math.min(4, zoom)) }),

  toggleGrid: () => set((state) => ({ gridVisible: !state.gridVisible })),

  toggleCollisionLayer: () =>
    set((state) => ({ collisionLayerVisible: !state.collisionLayerVisible })),

  pushHistory: (entry) => {
    const { history, historyIndex } = get();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ ...entry, timestamp: Date.now() });

    // Limit history to 50 entries
    if (newHistory.length > 50) {
      newHistory.shift();
    }

    set({
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  undo: () => {
    const { historyIndex } = get();
    if (historyIndex >= 0) {
      set({ historyIndex: historyIndex - 1 });
    }
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      set({ historyIndex: historyIndex + 1 });
    }
  },

  resetEditor: () => set(initialState),
}));
