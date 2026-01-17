import { create } from "zustand";

// Basic types - will be expanded in issue #5
interface Position {
  x: number;
  y: number;
}

interface ProjectSettings {
  tileSize: number;
  screenWidth: number;
  screenHeight: number;
  startMapId: string;
  startPosition: Position;
}

interface Tileset {
  id: string;
  name: string;
  image: string;
  tileWidth: number;
  tileHeight: number;
  columns: number;
  tileCount: number;
}

interface Layer {
  id: string;
  name: string;
  type: "ground" | "object" | "overlay" | "collision";
  visible: boolean;
  opacity: number;
  data: number[];
}

export type NPCBehavior = "stationary" | "random" | "patrol";
export type NPCDirection = "up" | "down" | "left" | "right";

interface NPCInstance {
  id: string;
  name: string;
  position: Position;
  spritesheet: string;
  direction: NPCDirection;
  behavior: NPCBehavior;
  movementSpeed: number; // 1-5
}

export type EventTrigger = "action" | "touch" | "autorun" | "parallel";

// Condition types for event pages
export type ConditionType =
  | "switch"
  | "variable"
  | "hasItem"
  | "hasMonster"
  | "partySize";

export interface EventCondition {
  id: string;
  type: ConditionType;
  // Parameters vary by type
  switchId?: string;
  switchValue?: boolean;
  variableId?: string;
  variableOp?: "==" | "!=" | ">" | "<" | ">=" | "<=";
  variableValue?: number;
  itemId?: string;
  monsterId?: string;
  partySizeOp?: "==" | "!=" | ">" | "<" | ">=" | "<=";
  partySizeValue?: number;
}

// Command types for event pages
export type CommandType =
  | "showMessage"
  | "showChoices"
  | "setSwitch"
  | "setVariable"
  | "conditional"
  | "teleport"
  | "giveMonster";

export interface EventCommand {
  id: string;
  type: CommandType;
  // Parameters vary by type
  message?: string;
  choices?: string[];
  choiceResults?: string[]; // Command IDs to jump to
  switchId?: string;
  switchValue?: boolean;
  variableId?: string;
  variableOp?: "=" | "+=" | "-=" | "*=" | "/=";
  variableValue?: number;
  condition?: EventCondition;
  thenCommands?: string[]; // Command IDs for true branch
  elseCommands?: string[]; // Command IDs for false branch
  teleportMapId?: string;
  teleportX?: number;
  teleportY?: number;
  monsterId?: string;
  monsterLevel?: number;
}

export interface EventPage {
  id: string;
  conditions: EventCondition[];
  commands: EventCommand[];
  // Page-specific appearance/graphic (optional)
  graphic?: string;
}

interface MapEvent {
  id: string;
  name: string;
  position: Position;
  width: number;
  height: number;
  trigger: EventTrigger;
  pages: EventPage[];
}

interface GameMap {
  id: string;
  name: string;
  width: number;
  height: number;
  tilesetIds: string[];
  layers: Layer[];
  npcs: NPCInstance[];
  events: MapEvent[];
}

interface Project {
  id: string;
  name: string;
  version: string;
  createdAt: string;
  updatedAt: string;
  settings: ProjectSettings;
  tilesets: Tileset[];
  maps: GameMap[];
}

interface ProjectState {
  // Current project
  project: Project | null;
  isDirty: boolean;

  // Actions
  createProject: (name: string) => void;
  loadProject: (project: Project) => void;
  updateProject: (updates: Partial<Project>) => void;
  closeProject: () => void;

  // Map management
  addMap: (map: GameMap) => void;
  updateMap: (mapId: string, updates: Partial<GameMap>) => void;
  deleteMap: (mapId: string) => void;
  getMap: (mapId: string) => GameMap | undefined;

  // Tileset management
  addTileset: (tileset: Tileset) => void;
  updateTileset: (tilesetId: string, updates: Partial<Tileset>) => void;
  deleteTileset: (tilesetId: string) => void;

  // Layer management
  addLayer: (mapId: string, layer: Layer) => void;
  updateLayer: (
    mapId: string,
    layerId: string,
    updates: Partial<Layer>,
  ) => void;
  deleteLayer: (mapId: string, layerId: string) => void;
  reorderLayers: (mapId: string, layerIds: string[]) => void;

  // Tile operations
  getTileAt: (mapId: string, layerId: string, x: number, y: number) => number;
  setTile: (
    mapId: string,
    layerId: string,
    x: number,
    y: number,
    tileId: number,
  ) => void;
  setTiles: (
    mapId: string,
    layerId: string,
    tiles: Array<{ x: number; y: number; tileId: number }>,
  ) => void;

  // NPC management
  addNPC: (mapId: string, npc: NPCInstance) => void;
  updateNPC: (
    mapId: string,
    npcId: string,
    updates: Partial<NPCInstance>,
  ) => void;
  deleteNPC: (mapId: string, npcId: string) => void;

  // Event management
  addEvent: (mapId: string, event: MapEvent) => void;
  updateEvent: (
    mapId: string,
    eventId: string,
    updates: Partial<MapEvent>,
  ) => void;
  deleteEvent: (mapId: string, eventId: string) => void;

  // Utility
  markDirty: () => void;
  markClean: () => void;
}

const createDefaultProject = (name: string): Project => ({
  id: crypto.randomUUID(),
  name,
  version: "1.0.0",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  settings: {
    tileSize: 16,
    screenWidth: 15, // 240px / 16
    screenHeight: 10, // 160px / 16
    startMapId: "",
    startPosition: { x: 0, y: 0 },
  },
  tilesets: [
    {
      id: "placeholder-tileset",
      name: "Placeholder Tileset",
      image: "/assets/tilesets/placeholder-tileset.png",
      tileWidth: 16,
      tileHeight: 16,
      columns: 8,
      tileCount: 64,
    },
  ],
  maps: [],
});

const createDefaultMap = (name: string): GameMap => ({
  id: crypto.randomUUID(),
  name,
  width: 20,
  height: 15,
  tilesetIds: [],
  layers: [
    {
      id: crypto.randomUUID(),
      name: "Ground",
      type: "ground",
      visible: true,
      opacity: 1,
      data: new Array(20 * 15).fill(0),
    },
  ],
  npcs: [],
  events: [],
});

export const useProjectStore = create<ProjectState>((set, get) => ({
  project: null,
  isDirty: false,

  createProject: (name) => {
    const project = createDefaultProject(name);
    const starterMap = createDefaultMap("Starter Map");
    project.maps.push(starterMap);
    project.settings.startMapId = starterMap.id;
    set({ project, isDirty: false });
  },

  loadProject: (project) => set({ project, isDirty: false }),

  updateProject: (updates) =>
    set((state) => ({
      project: state.project
        ? { ...state.project, ...updates, updatedAt: new Date().toISOString() }
        : null,
      isDirty: true,
    })),

  closeProject: () => set({ project: null, isDirty: false }),

  addMap: (map) =>
    set((state) => ({
      project: state.project
        ? { ...state.project, maps: [...state.project.maps, map] }
        : null,
      isDirty: true,
    })),

  updateMap: (mapId, updates) =>
    set((state) => ({
      project: state.project
        ? {
            ...state.project,
            maps: state.project.maps.map((m) =>
              m.id === mapId ? { ...m, ...updates } : m,
            ),
          }
        : null,
      isDirty: true,
    })),

  deleteMap: (mapId) =>
    set((state) => ({
      project: state.project
        ? {
            ...state.project,
            maps: state.project.maps.filter((m) => m.id !== mapId),
          }
        : null,
      isDirty: true,
    })),

  getMap: (mapId) => get().project?.maps.find((m) => m.id === mapId),

  addTileset: (tileset) =>
    set((state) => ({
      project: state.project
        ? { ...state.project, tilesets: [...state.project.tilesets, tileset] }
        : null,
      isDirty: true,
    })),

  updateTileset: (tilesetId, updates) =>
    set((state) => ({
      project: state.project
        ? {
            ...state.project,
            tilesets: state.project.tilesets.map((t) =>
              t.id === tilesetId ? { ...t, ...updates } : t,
            ),
          }
        : null,
      isDirty: true,
    })),

  deleteTileset: (tilesetId) =>
    set((state) => ({
      project: state.project
        ? {
            ...state.project,
            tilesets: state.project.tilesets.filter((t) => t.id !== tilesetId),
          }
        : null,
      isDirty: true,
    })),

  addLayer: (mapId, layer) =>
    set((state) => {
      if (!state.project) return state;
      return {
        project: {
          ...state.project,
          maps: state.project.maps.map((m) =>
            m.id === mapId ? { ...m, layers: [...m.layers, layer] } : m,
          ),
        },
        isDirty: true,
      };
    }),

  updateLayer: (mapId, layerId, updates) =>
    set((state) => {
      if (!state.project) return state;
      return {
        project: {
          ...state.project,
          maps: state.project.maps.map((m) =>
            m.id === mapId
              ? {
                  ...m,
                  layers: m.layers.map((l) =>
                    l.id === layerId ? { ...l, ...updates } : l,
                  ),
                }
              : m,
          ),
        },
        isDirty: true,
      };
    }),

  deleteLayer: (mapId, layerId) =>
    set((state) => {
      if (!state.project) return state;
      return {
        project: {
          ...state.project,
          maps: state.project.maps.map((m) =>
            m.id === mapId
              ? { ...m, layers: m.layers.filter((l) => l.id !== layerId) }
              : m,
          ),
        },
        isDirty: true,
      };
    }),

  reorderLayers: (mapId, layerIds) =>
    set((state) => {
      if (!state.project) return state;
      return {
        project: {
          ...state.project,
          maps: state.project.maps.map((m) => {
            if (m.id !== mapId) return m;
            const layerMap = new Map(m.layers.map((l) => [l.id, l]));
            const reorderedLayers = layerIds
              .map((id) => layerMap.get(id))
              .filter((l): l is Layer => l !== undefined);
            return { ...m, layers: reorderedLayers };
          }),
        },
        isDirty: true,
      };
    }),

  getTileAt: (mapId, layerId, x, y) => {
    const map = get().getMap(mapId);
    if (!map) return 0;

    const layer = map.layers.find((l) => l.id === layerId);
    if (!layer) return 0;

    const index = y * map.width + x;
    if (index < 0 || index >= layer.data.length) return 0;

    return layer.data[index];
  },

  setTile: (mapId, layerId, x, y, tileId) => {
    const map = get().getMap(mapId);
    if (!map) return;

    const layer = map.layers.find((l) => l.id === layerId);
    if (!layer) return;

    const index = y * map.width + x;
    if (index < 0 || index >= layer.data.length) return;

    const newData = [...layer.data];
    newData[index] = tileId;

    get().updateLayer(mapId, layerId, { data: newData });
  },

  setTiles: (mapId, layerId, tiles) => {
    const map = get().getMap(mapId);
    if (!map) return;

    const layer = map.layers.find((l) => l.id === layerId);
    if (!layer) return;

    const newData = [...layer.data];
    for (const { x, y, tileId } of tiles) {
      const index = y * map.width + x;
      if (index >= 0 && index < newData.length) {
        newData[index] = tileId;
      }
    }

    get().updateLayer(mapId, layerId, { data: newData });
  },

  addNPC: (mapId, npc) =>
    set((state) => {
      if (!state.project) return state;
      return {
        project: {
          ...state.project,
          maps: state.project.maps.map((m) =>
            m.id === mapId ? { ...m, npcs: [...m.npcs, npc] } : m,
          ),
        },
        isDirty: true,
      };
    }),

  updateNPC: (mapId, npcId, updates) =>
    set((state) => {
      if (!state.project) return state;
      return {
        project: {
          ...state.project,
          maps: state.project.maps.map((m) =>
            m.id === mapId
              ? {
                  ...m,
                  npcs: m.npcs.map((n) =>
                    n.id === npcId ? { ...n, ...updates } : n,
                  ),
                }
              : m,
          ),
        },
        isDirty: true,
      };
    }),

  deleteNPC: (mapId, npcId) =>
    set((state) => {
      if (!state.project) return state;
      return {
        project: {
          ...state.project,
          maps: state.project.maps.map((m) =>
            m.id === mapId
              ? { ...m, npcs: m.npcs.filter((n) => n.id !== npcId) }
              : m,
          ),
        },
        isDirty: true,
      };
    }),

  addEvent: (mapId, event) =>
    set((state) => {
      if (!state.project) return state;
      return {
        project: {
          ...state.project,
          maps: state.project.maps.map((m) =>
            m.id === mapId ? { ...m, events: [...m.events, event] } : m,
          ),
        },
        isDirty: true,
      };
    }),

  updateEvent: (mapId, eventId, updates) =>
    set((state) => {
      if (!state.project) return state;
      return {
        project: {
          ...state.project,
          maps: state.project.maps.map((m) =>
            m.id === mapId
              ? {
                  ...m,
                  events: m.events.map((e) =>
                    e.id === eventId ? { ...e, ...updates } : e,
                  ),
                }
              : m,
          ),
        },
        isDirty: true,
      };
    }),

  deleteEvent: (mapId, eventId) =>
    set((state) => {
      if (!state.project) return state;
      return {
        project: {
          ...state.project,
          maps: state.project.maps.map((m) =>
            m.id === mapId
              ? { ...m, events: m.events.filter((e) => e.id !== eventId) }
              : m,
          ),
        },
        isDirty: true,
      };
    }),

  markDirty: () => set({ isDirty: true }),
  markClean: () => set({ isDirty: false }),
}));
