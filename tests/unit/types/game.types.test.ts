import { describe, expect, it } from "vitest";
import {
  CommandSchema,
  ConditionSchema,
  DirectionSchema,
  EditorToolSchema,
  EventPageSchema,
  EventTriggerSchema,
  GameMapSchema,
  HistoryEntrySchema,
  LayerSchema,
  LayerTypeSchema,
  MapEventSchema,
  NPCInstanceSchema,
  PlayerStateSchema,
  PositionSchema,
  ProjectSchema,
  ProjectSettingsSchema,
  safeValidateMap,
  safeValidateProject,
  TilesetSchema,
  validateLayer,
  validateMap,
  validateNPC,
  validateProject,
  validateTileset,
} from "@/types/game.types";

describe("Position Schema", () => {
  it("should validate valid positions", () => {
    expect(PositionSchema.parse({ x: 0, y: 0 })).toEqual({ x: 0, y: 0 });
    expect(PositionSchema.parse({ x: 10, y: 20 })).toEqual({ x: 10, y: 20 });
    expect(PositionSchema.parse({ x: -5, y: -10 })).toEqual({ x: -5, y: -10 });
  });

  it("should reject non-integer positions", () => {
    expect(() => PositionSchema.parse({ x: 1.5, y: 2 })).toThrow();
    expect(() => PositionSchema.parse({ x: 1, y: 2.5 })).toThrow();
  });

  it("should reject missing fields", () => {
    expect(() => PositionSchema.parse({ x: 0 })).toThrow();
    expect(() => PositionSchema.parse({ y: 0 })).toThrow();
    expect(() => PositionSchema.parse({})).toThrow();
  });
});

describe("Direction Schema", () => {
  it("should validate valid directions", () => {
    expect(DirectionSchema.parse("up")).toBe("up");
    expect(DirectionSchema.parse("down")).toBe("down");
    expect(DirectionSchema.parse("left")).toBe("left");
    expect(DirectionSchema.parse("right")).toBe("right");
  });

  it("should reject invalid directions", () => {
    expect(() => DirectionSchema.parse("north")).toThrow();
    expect(() => DirectionSchema.parse("")).toThrow();
    expect(() => DirectionSchema.parse(1)).toThrow();
  });
});

describe("EditorTool Schema", () => {
  it("should validate all editor tools", () => {
    const tools = [
      "select",
      "paint",
      "erase",
      "fill",
      "rectangle",
      "npc",
      "event",
      "spawn",
    ];
    for (const tool of tools) {
      expect(EditorToolSchema.parse(tool)).toBe(tool);
    }
  });

  it("should reject invalid tools", () => {
    expect(() => EditorToolSchema.parse("invalid")).toThrow();
  });
});

describe("HistoryEntry Schema", () => {
  it("should validate valid history entries", () => {
    const entry = {
      type: "tile",
      mapId: "map-1",
      data: { x: 0, y: 0, tileId: 1 },
      timestamp: Date.now(),
    };
    expect(HistoryEntrySchema.parse(entry)).toEqual(entry);
  });

  it("should reject empty mapId", () => {
    expect(() =>
      HistoryEntrySchema.parse({
        type: "tile",
        mapId: "",
        data: {},
        timestamp: Date.now(),
      }),
    ).toThrow();
  });
});

describe("PlayerState Schema", () => {
  it("should validate valid player state", () => {
    const state = {
      mapId: "map-1",
      position: { x: 5, y: 10 },
      direction: "down",
    };
    expect(PlayerStateSchema.parse(state)).toEqual(state);
  });

  it("should allow empty mapId", () => {
    const state = {
      mapId: "",
      position: { x: 0, y: 0 },
      direction: "down",
    };
    expect(PlayerStateSchema.parse(state).mapId).toBe("");
  });
});

describe("Tileset Schema", () => {
  it("should validate valid tileset", () => {
    const tileset = {
      id: "tileset-1",
      name: "Grass Tiles",
      image: "grass.png",
      tileWidth: 16,
      tileHeight: 16,
      columns: 8,
      tileCount: 64,
    };
    expect(TilesetSchema.parse(tileset)).toEqual(tileset);
  });

  it("should reject non-positive dimensions", () => {
    const baseTileset = {
      id: "tileset-1",
      name: "Test",
      image: "test.png",
      tileWidth: 16,
      tileHeight: 16,
      columns: 8,
      tileCount: 64,
    };

    expect(() =>
      TilesetSchema.parse({ ...baseTileset, tileWidth: 0 }),
    ).toThrow();
    expect(() =>
      TilesetSchema.parse({ ...baseTileset, tileHeight: -1 }),
    ).toThrow();
    expect(() => TilesetSchema.parse({ ...baseTileset, columns: 0 })).toThrow();
  });

  it("should allow zero tileCount", () => {
    const tileset = {
      id: "tileset-1",
      name: "Empty",
      image: "empty.png",
      tileWidth: 16,
      tileHeight: 16,
      columns: 1,
      tileCount: 0,
    };
    expect(TilesetSchema.parse(tileset).tileCount).toBe(0);
  });
});

describe("Layer Schema", () => {
  it("should validate valid layer", () => {
    const layer = {
      id: "layer-1",
      name: "Ground",
      type: "ground",
      visible: true,
      opacity: 1,
      data: [0, 1, 2, 3],
    };
    expect(LayerSchema.parse(layer)).toEqual(layer);
  });

  it("should validate all layer types", () => {
    const types = ["ground", "object", "overlay", "collision"];
    for (const type of types) {
      expect(LayerTypeSchema.parse(type)).toBe(type);
    }
  });

  it("should clamp opacity to valid range", () => {
    const baseLayer = {
      id: "layer-1",
      name: "Test",
      type: "ground",
      visible: true,
      data: [],
    };

    expect(() => LayerSchema.parse({ ...baseLayer, opacity: 1.5 })).toThrow();
    expect(() => LayerSchema.parse({ ...baseLayer, opacity: -0.1 })).toThrow();
    expect(LayerSchema.parse({ ...baseLayer, opacity: 0 }).opacity).toBe(0);
    expect(LayerSchema.parse({ ...baseLayer, opacity: 1 }).opacity).toBe(1);
    expect(LayerSchema.parse({ ...baseLayer, opacity: 0.5 }).opacity).toBe(0.5);
  });

  it("should reject negative tile IDs in data", () => {
    expect(() =>
      LayerSchema.parse({
        id: "layer-1",
        name: "Test",
        type: "ground",
        visible: true,
        opacity: 1,
        data: [0, -1, 2],
      }),
    ).toThrow();
  });
});

describe("NPC Schema", () => {
  it("should validate valid NPC", () => {
    const npc = {
      id: "npc-1",
      name: "Villager",
      position: { x: 5, y: 10 },
      spritesheet: "villager.png",
      direction: "down",
    };
    expect(NPCInstanceSchema.parse(npc)).toEqual(npc);
  });

  it("should reject empty required fields", () => {
    const baseNPC = {
      id: "npc-1",
      name: "Villager",
      position: { x: 5, y: 10 },
      spritesheet: "villager.png",
      direction: "down",
    };

    expect(() => NPCInstanceSchema.parse({ ...baseNPC, id: "" })).toThrow();
    expect(() => NPCInstanceSchema.parse({ ...baseNPC, name: "" })).toThrow();
    expect(() =>
      NPCInstanceSchema.parse({ ...baseNPC, spritesheet: "" }),
    ).toThrow();
  });
});

describe("Event Schema", () => {
  it("should validate all event triggers", () => {
    const triggers = ["action", "touch", "autorun", "parallel"];
    for (const trigger of triggers) {
      expect(EventTriggerSchema.parse(trigger)).toBe(trigger);
    }
  });

  it("should validate valid map event", () => {
    const event = {
      id: "event-1",
      name: "Treasure Chest",
      position: { x: 10, y: 5 },
      trigger: "action",
    };
    expect(MapEventSchema.parse(event)).toEqual(event);
  });

  it("should validate event with pages", () => {
    const event = {
      id: "event-1",
      name: "NPC Talk",
      position: { x: 5, y: 5 },
      trigger: "action",
      pages: [
        {
          id: "page-1",
          conditions: [],
          commands: [
            {
              id: "cmd-1",
              type: "show_text",
              text: "Hello!",
            },
          ],
        },
      ],
    };
    expect(MapEventSchema.parse(event)).toEqual(event);
  });
});

describe("Condition Schema", () => {
  it("should validate switch condition", () => {
    const condition = {
      type: "switch",
      id: "switch-1",
      value: true,
    };
    expect(ConditionSchema.parse(condition)).toEqual(condition);
  });

  it("should validate variable condition with operator", () => {
    const condition = {
      type: "variable",
      id: "gold",
      operator: ">=",
      value: 100,
    };
    expect(ConditionSchema.parse(condition)).toEqual(condition);
  });
});

describe("Command Schema", () => {
  it("should validate show_text command", () => {
    const command = {
      id: "cmd-1",
      type: "show_text",
      text: "Hello, world!",
    };
    expect(CommandSchema.parse(command)).toEqual(command);
  });

  it("should validate show_choices command", () => {
    const command = {
      id: "cmd-1",
      type: "show_choices",
      choices: ["Yes", "No"],
    };
    expect(CommandSchema.parse(command)).toEqual(command);
  });

  it("should reject show_choices with too many options", () => {
    expect(() =>
      CommandSchema.parse({
        id: "cmd-1",
        type: "show_choices",
        choices: ["A", "B", "C", "D", "E"],
      }),
    ).toThrow();
  });

  it("should validate set_switch command", () => {
    const command = {
      id: "cmd-1",
      type: "set_switch",
      switchId: "door_open",
      value: true,
    };
    expect(CommandSchema.parse(command)).toEqual(command);
  });

  it("should validate set_variable command", () => {
    const command = {
      id: "cmd-1",
      type: "set_variable",
      variableId: "gold",
      operation: "add",
      value: 100,
    };
    expect(CommandSchema.parse(command)).toEqual(command);
  });

  it("should validate transfer_player command", () => {
    const command = {
      id: "cmd-1",
      type: "transfer_player",
      mapId: "map-2",
      position: { x: 5, y: 10 },
      direction: "down",
      fadeType: "black",
    };
    expect(CommandSchema.parse(command)).toEqual(command);
  });

  it("should validate wait command", () => {
    const command = {
      id: "cmd-1",
      type: "wait",
      frames: 60,
    };
    expect(CommandSchema.parse(command)).toEqual(command);
  });

  it("should reject wait command with non-positive frames", () => {
    expect(() =>
      CommandSchema.parse({
        id: "cmd-1",
        type: "wait",
        frames: 0,
      }),
    ).toThrow();
  });
});

describe("EventPage Schema", () => {
  it("should validate minimal event page", () => {
    const page = {
      id: "page-1",
      conditions: [],
      commands: [],
    };
    expect(EventPageSchema.parse(page)).toEqual(page);
  });

  it("should validate event page with graphic", () => {
    const page = {
      id: "page-1",
      conditions: [],
      commands: [],
      graphic: {
        spritesheet: "npc.png",
        index: 0,
        direction: "down",
      },
    };
    expect(EventPageSchema.parse(page)).toEqual(page);
  });

  it("should validate event page with movement settings", () => {
    const page = {
      id: "page-1",
      conditions: [],
      commands: [],
      moveType: "random",
      moveSpeed: 3,
      moveFrequency: 3,
      priorityType: "same",
      through: false,
    };
    expect(EventPageSchema.parse(page)).toEqual(page);
  });
});

describe("GameMap Schema", () => {
  it("should validate valid game map", () => {
    const map = {
      id: "map-1",
      name: "Town Square",
      width: 20,
      height: 15,
      tilesetIds: ["tileset-1"],
      layers: [
        {
          id: "layer-1",
          name: "Ground",
          type: "ground",
          visible: true,
          opacity: 1,
          data: new Array(300).fill(0),
        },
      ],
      npcs: [],
      events: [],
    };
    expect(GameMapSchema.parse(map)).toEqual(map);
  });

  it("should reject non-positive dimensions", () => {
    const baseMap = {
      id: "map-1",
      name: "Test",
      width: 20,
      height: 15,
      tilesetIds: [],
      layers: [],
      npcs: [],
      events: [],
    };

    expect(() => GameMapSchema.parse({ ...baseMap, width: 0 })).toThrow();
    expect(() => GameMapSchema.parse({ ...baseMap, height: -1 })).toThrow();
  });
});

describe("ProjectSettings Schema", () => {
  it("should validate valid settings", () => {
    const settings = {
      tileSize: 16,
      screenWidth: 15,
      screenHeight: 10,
      startMapId: "map-1",
      startPosition: { x: 5, y: 5 },
    };
    expect(ProjectSettingsSchema.parse(settings)).toEqual(settings);
  });

  it("should allow empty startMapId", () => {
    const settings = {
      tileSize: 16,
      screenWidth: 15,
      screenHeight: 10,
      startMapId: "",
      startPosition: { x: 0, y: 0 },
    };
    expect(ProjectSettingsSchema.parse(settings).startMapId).toBe("");
  });
});

describe("Project Schema", () => {
  const validProject = {
    id: "project-1",
    name: "My Game",
    version: "1.0.0",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
    settings: {
      tileSize: 16,
      screenWidth: 15,
      screenHeight: 10,
      startMapId: "map-1",
      startPosition: { x: 5, y: 5 },
    },
    tilesets: [],
    maps: [],
  };

  it("should validate valid project", () => {
    expect(ProjectSchema.parse(validProject)).toEqual(validProject);
  });

  it("should reject invalid version format", () => {
    expect(() =>
      ProjectSchema.parse({ ...validProject, version: "1.0" }),
    ).toThrow();
    expect(() =>
      ProjectSchema.parse({ ...validProject, version: "v1.0.0" }),
    ).toThrow();
  });

  it("should reject invalid datetime format", () => {
    expect(() =>
      ProjectSchema.parse({ ...validProject, createdAt: "not-a-date" }),
    ).toThrow();
  });
});

describe("Validation Helpers", () => {
  describe("validateProject", () => {
    it("should return valid project", () => {
      const project = {
        id: "project-1",
        name: "Test",
        version: "1.0.0",
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
        settings: {
          tileSize: 16,
          screenWidth: 15,
          screenHeight: 10,
          startMapId: "",
          startPosition: { x: 0, y: 0 },
        },
        tilesets: [],
        maps: [],
      };
      expect(validateProject(project)).toEqual(project);
    });

    it("should throw on invalid project", () => {
      expect(() => validateProject({})).toThrow();
    });
  });

  describe("validateMap", () => {
    it("should return valid map", () => {
      const map = {
        id: "map-1",
        name: "Test",
        width: 10,
        height: 10,
        tilesetIds: [],
        layers: [],
        npcs: [],
        events: [],
      };
      expect(validateMap(map)).toEqual(map);
    });
  });

  describe("validateTileset", () => {
    it("should return valid tileset", () => {
      const tileset = {
        id: "ts-1",
        name: "Test",
        image: "test.png",
        tileWidth: 16,
        tileHeight: 16,
        columns: 8,
        tileCount: 64,
      };
      expect(validateTileset(tileset)).toEqual(tileset);
    });
  });

  describe("validateLayer", () => {
    it("should return valid layer", () => {
      const layer = {
        id: "layer-1",
        name: "Ground",
        type: "ground",
        visible: true,
        opacity: 1,
        data: [],
      };
      expect(validateLayer(layer)).toEqual(layer);
    });
  });

  describe("validateNPC", () => {
    it("should return valid NPC", () => {
      const npc = {
        id: "npc-1",
        name: "Test NPC",
        position: { x: 0, y: 0 },
        spritesheet: "npc.png",
        direction: "down",
      };
      expect(validateNPC(npc)).toEqual(npc);
    });
  });

  describe("safeValidateProject", () => {
    it("should return success for valid project", () => {
      const project = {
        id: "project-1",
        name: "Test",
        version: "1.0.0",
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
        settings: {
          tileSize: 16,
          screenWidth: 15,
          screenHeight: 10,
          startMapId: "",
          startPosition: { x: 0, y: 0 },
        },
        tilesets: [],
        maps: [],
      };
      const result = safeValidateProject(project);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(project);
      }
    });

    it("should return error for invalid project", () => {
      const result = safeValidateProject({});
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });
  });

  describe("safeValidateMap", () => {
    it("should return success for valid map", () => {
      const map = {
        id: "map-1",
        name: "Test",
        width: 10,
        height: 10,
        tilesetIds: [],
        layers: [],
        npcs: [],
        events: [],
      };
      const result = safeValidateMap(map);
      expect(result.success).toBe(true);
    });

    it("should return error for invalid map", () => {
      const result = safeValidateMap({ id: "map-1" });
      expect(result.success).toBe(false);
    });
  });
});
