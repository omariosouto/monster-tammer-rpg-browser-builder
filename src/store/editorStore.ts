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

// History entry types for undo/redo
type TileChangeEntry = {
  type: "tile";
  mapId: string;
  layerId: string;
  changes: Array<{
    x: number;
    y: number;
    oldTileId: number;
    newTileId: number;
  }>;
};

type LayerAddEntry = {
  type: "layer_add";
  mapId: string;
  layerId: string;
};

type LayerDeleteEntry = {
  type: "layer_delete";
  mapId: string;
  layerData: {
    id: string;
    name: string;
    type: "ground" | "object" | "overlay" | "collision";
    visible: boolean;
    opacity: number;
    data: number[];
  };
  index: number;
};

type LayerUpdateEntry = {
  type: "layer_update";
  mapId: string;
  layerId: string;
  oldData: Partial<{
    name: string;
    visible: boolean;
    opacity: number;
  }>;
  newData: Partial<{
    name: string;
    visible: boolean;
    opacity: number;
  }>;
};

type NPCAddEntry = {
  type: "npc_add";
  mapId: string;
  npcData: {
    id: string;
    name: string;
    position: { x: number; y: number };
    spritesheet: string;
    direction: "up" | "down" | "left" | "right";
    behavior: "stationary" | "random" | "patrol";
    movementSpeed: number;
  };
};

type NPCDeleteEntry = {
  type: "npc_delete";
  mapId: string;
  npcData: {
    id: string;
    name: string;
    position: { x: number; y: number };
    spritesheet: string;
    direction: "up" | "down" | "left" | "right";
    behavior: "stationary" | "random" | "patrol";
    movementSpeed: number;
  };
};

type EventAddEntry = {
  type: "event_add";
  mapId: string;
  eventData: {
    id: string;
    name: string;
    position: { x: number; y: number };
    width: number;
    height: number;
    trigger: "action" | "touch" | "autorun" | "parallel";
  };
};

type EventDeleteEntry = {
  type: "event_delete";
  mapId: string;
  eventData: {
    id: string;
    name: string;
    position: { x: number; y: number };
    width: number;
    height: number;
    trigger: "action" | "touch" | "autorun" | "parallel";
  };
};

export type HistoryEntry =
  | TileChangeEntry
  | LayerAddEntry
  | LayerDeleteEntry
  | LayerUpdateEntry
  | NPCAddEntry
  | NPCDeleteEntry
  | EventAddEntry
  | EventDeleteEntry;

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
  pushHistory: (entry: HistoryEntry) => void;
  undo: () => HistoryEntry | null;
  redo: () => HistoryEntry | null;
  canUndo: () => boolean;
  canRedo: () => boolean;
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
    // Remove any entries after current index (discard redo stack)
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(entry);

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
    const { history, historyIndex } = get();
    if (historyIndex >= 0) {
      const entry = history[historyIndex];
      set({ historyIndex: historyIndex - 1 });
      return entry;
    }
    return null;
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      const entry = history[historyIndex + 1];
      set({ historyIndex: historyIndex + 1 });
      return entry;
    }
    return null;
  },

  canUndo: () => get().historyIndex >= 0,

  canRedo: () => {
    const { history, historyIndex } = get();
    return historyIndex < history.length - 1;
  },

  resetEditor: () => set(initialState),
}));
