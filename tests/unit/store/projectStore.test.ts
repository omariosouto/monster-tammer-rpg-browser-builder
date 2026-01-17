import { act } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useProjectStore } from "@/store/projectStore";

describe("projectStore", () => {
  beforeEach(() => {
    act(() => {
      useProjectStore.getState().closeProject();
    });
  });

  describe("initial state", () => {
    it("should have no project loaded", () => {
      const state = useProjectStore.getState();
      expect(state.project).toBeNull();
      expect(state.isDirty).toBe(false);
    });
  });

  describe("project lifecycle", () => {
    it("should create a new project", () => {
      act(() => {
        useProjectStore.getState().createProject("My Game");
      });

      const state = useProjectStore.getState();
      expect(state.project).not.toBeNull();
      expect(state.project?.name).toBe("My Game");
      expect(state.project?.version).toBe("1.0.0");
      expect(state.isDirty).toBe(false);
    });

    it("should create project with default settings", () => {
      act(() => {
        useProjectStore.getState().createProject("Test Project");
      });

      const settings = useProjectStore.getState().project?.settings;
      expect(settings?.tileSize).toBe(16);
      expect(settings?.screenWidth).toBe(15);
      expect(settings?.screenHeight).toBe(10);
    });

    it("should create project with starter map", () => {
      act(() => {
        useProjectStore.getState().createProject("Test");
      });

      const project = useProjectStore.getState().project;
      expect(project?.maps).toHaveLength(1);
      expect(project?.maps[0].name).toBe("Starter Map");
      expect(project?.settings.startMapId).toBe(project?.maps[0].id);
    });

    it("should load an existing project", () => {
      const existingProject = {
        id: "existing-id",
        name: "Loaded Project",
        version: "2.0.0",
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

      act(() => {
        useProjectStore.getState().loadProject(existingProject);
      });

      const state = useProjectStore.getState();
      expect(state.project?.id).toBe("existing-id");
      expect(state.project?.name).toBe("Loaded Project");
      expect(state.isDirty).toBe(false);
    });

    it("should update project", () => {
      act(() => {
        useProjectStore.getState().createProject("Original Name");
        useProjectStore.getState().updateProject({ name: "New Name" });
      });

      const state = useProjectStore.getState();
      expect(state.project?.name).toBe("New Name");
      expect(state.isDirty).toBe(true);
    });

    it("should close project", () => {
      act(() => {
        useProjectStore.getState().createProject("To Close");
        useProjectStore.getState().closeProject();
      });

      const state = useProjectStore.getState();
      expect(state.project).toBeNull();
      expect(state.isDirty).toBe(false);
    });
  });

  describe("map management", () => {
    beforeEach(() => {
      act(() => {
        useProjectStore.getState().createProject("Test Project");
      });
    });

    it("should add a map", () => {
      const newMap = {
        id: "new-map-id",
        name: "New Map",
        width: 30,
        height: 20,
        tilesetIds: [],
        layers: [],
        npcs: [],
        events: [],
      };

      act(() => {
        useProjectStore.getState().addMap(newMap);
      });

      const maps = useProjectStore.getState().project?.maps;
      expect(maps).toHaveLength(2); // Starter map + new map
      expect(maps?.find((m) => m.id === "new-map-id")).toBeDefined();
    });

    it("should update a map", () => {
      const mapId = useProjectStore.getState().project?.maps[0].id as string;

      act(() => {
        useProjectStore.getState().updateMap(mapId, { name: "Updated Map" });
      });

      const map = useProjectStore.getState().getMap(mapId);
      expect(map?.name).toBe("Updated Map");
    });

    it("should delete a map", () => {
      const mapId = useProjectStore.getState().project?.maps[0].id as string;

      act(() => {
        useProjectStore.getState().deleteMap(mapId);
      });

      expect(useProjectStore.getState().project?.maps).toHaveLength(0);
    });

    it("should get a map by id", () => {
      const mapId = useProjectStore.getState().project?.maps[0].id as string;
      const map = useProjectStore.getState().getMap(mapId);

      expect(map).toBeDefined();
      expect(map?.id).toBe(mapId);
    });

    it("should return undefined for non-existent map", () => {
      const map = useProjectStore.getState().getMap("nonexistent");
      expect(map).toBeUndefined();
    });
  });

  describe("tileset management", () => {
    beforeEach(() => {
      act(() => {
        useProjectStore.getState().createProject("Test Project");
      });
    });

    it("should add a tileset", () => {
      const tileset = {
        id: "tileset-1",
        name: "Grass Tiles",
        image: "grass.png",
        tileWidth: 16,
        tileHeight: 16,
        columns: 8,
        tileCount: 64,
      };

      const initialCount =
        useProjectStore.getState().project?.tilesets.length ?? 0;

      act(() => {
        useProjectStore.getState().addTileset(tileset);
      });

      const tilesets = useProjectStore.getState().project?.tilesets;
      expect(tilesets).toHaveLength(initialCount + 1);
      expect(tilesets?.find((t) => t.id === "tileset-1")?.name).toBe(
        "Grass Tiles",
      );
    });

    it("should update a tileset", () => {
      const tileset = {
        id: "tileset-1",
        name: "Original",
        image: "original.png",
        tileWidth: 16,
        tileHeight: 16,
        columns: 8,
        tileCount: 64,
      };

      act(() => {
        useProjectStore.getState().addTileset(tileset);
        useProjectStore
          .getState()
          .updateTileset("tileset-1", { name: "Updated" });
      });

      const updated = useProjectStore
        .getState()
        .project?.tilesets.find((t) => t.id === "tileset-1");
      expect(updated?.name).toBe("Updated");
    });

    it("should delete a tileset", () => {
      const tileset = {
        id: "tileset-1",
        name: "To Delete",
        image: "delete.png",
        tileWidth: 16,
        tileHeight: 16,
        columns: 8,
        tileCount: 64,
      };

      const initialCount =
        useProjectStore.getState().project?.tilesets.length ?? 0;

      act(() => {
        useProjectStore.getState().addTileset(tileset);
        useProjectStore.getState().deleteTileset("tileset-1");
      });

      const tilesets = useProjectStore.getState().project?.tilesets;
      expect(tilesets).toHaveLength(initialCount);
      expect(tilesets?.find((t) => t.id === "tileset-1")).toBeUndefined();
    });
  });

  describe("layer management", () => {
    let mapId: string;

    beforeEach(() => {
      act(() => {
        useProjectStore.getState().createProject("Test Project");
      });
      mapId = useProjectStore.getState().project?.maps[0].id as string;
    });

    it("should add a layer", () => {
      const layer = {
        id: "layer-2",
        name: "Objects",
        type: "object" as const,
        visible: true,
        opacity: 1,
        data: new Array(20 * 15).fill(0),
      };

      act(() => {
        useProjectStore.getState().addLayer(mapId, layer);
      });

      const map = useProjectStore.getState().getMap(mapId);
      expect(map?.layers).toHaveLength(2); // Ground + new layer
    });

    it("should update a layer", () => {
      const map = useProjectStore.getState().getMap(mapId);
      const layerId = map?.layers[0].id as string;

      act(() => {
        useProjectStore
          .getState()
          .updateLayer(mapId, layerId, { name: "Updated Layer" });
      });

      const updatedMap = useProjectStore.getState().getMap(mapId);
      expect(updatedMap?.layers[0].name).toBe("Updated Layer");
    });

    it("should delete a layer", () => {
      const map = useProjectStore.getState().getMap(mapId);
      const layerId = map?.layers[0].id as string;

      act(() => {
        useProjectStore.getState().deleteLayer(mapId, layerId);
      });

      const updatedMap = useProjectStore.getState().getMap(mapId);
      expect(updatedMap?.layers).toHaveLength(0);
    });

    it("should reorder layers", () => {
      const layer2 = {
        id: "layer-2",
        name: "Layer 2",
        type: "object" as const,
        visible: true,
        opacity: 1,
        data: [],
      };
      const layer3 = {
        id: "layer-3",
        name: "Layer 3",
        type: "overlay" as const,
        visible: true,
        opacity: 1,
        data: [],
      };

      const originalLayerId = useProjectStore.getState().getMap(mapId)
        ?.layers[0].id as string;

      act(() => {
        useProjectStore.getState().addLayer(mapId, layer2);
        useProjectStore.getState().addLayer(mapId, layer3);
        useProjectStore
          .getState()
          .reorderLayers(mapId, ["layer-3", "layer-2", originalLayerId]);
      });

      const map = useProjectStore.getState().getMap(mapId);
      expect(map?.layers[0].id).toBe("layer-3");
      expect(map?.layers[1].id).toBe("layer-2");
      expect(map?.layers[2].id).toBe(originalLayerId);
    });
  });

  describe("tile operations", () => {
    let mapId: string;
    let layerId: string;

    beforeEach(() => {
      act(() => {
        useProjectStore.getState().createProject("Test Project");
      });
      const map = useProjectStore.getState().project?.maps[0];
      mapId = map?.id as string;
      layerId = map?.layers[0].id as string;
    });

    it("should set a single tile", () => {
      act(() => {
        useProjectStore.getState().setTile(mapId, layerId, 5, 3, 42);
      });

      const map = useProjectStore.getState().getMap(mapId);
      const layer = map?.layers[0];
      const index = 3 * 20 + 5; // y * width + x
      expect(layer?.data[index]).toBe(42);
    });

    it("should set multiple tiles", () => {
      const tiles = [
        { x: 0, y: 0, tileId: 1 },
        { x: 1, y: 0, tileId: 2 },
        { x: 0, y: 1, tileId: 3 },
      ];

      act(() => {
        useProjectStore.getState().setTiles(mapId, layerId, tiles);
      });

      const map = useProjectStore.getState().getMap(mapId);
      const layer = map?.layers[0];
      expect(layer?.data[0]).toBe(1);
      expect(layer?.data[1]).toBe(2);
      expect(layer?.data[20]).toBe(3); // y=1, width=20
    });

    it("should not set tile outside bounds", () => {
      act(() => {
        useProjectStore.getState().setTile(mapId, layerId, 100, 100, 99);
      });

      const map = useProjectStore.getState().getMap(mapId);
      const layer = map?.layers[0];
      // Should not have modified any tile
      expect(layer?.data.every((t) => t === 0)).toBe(true);
    });
  });

  describe("NPC management", () => {
    let mapId: string;

    beforeEach(() => {
      act(() => {
        useProjectStore.getState().createProject("Test Project");
      });
      mapId = useProjectStore.getState().project?.maps[0].id as string;
    });

    it("should add an NPC", () => {
      const npc = {
        id: "npc-1",
        name: "Villager",
        position: { x: 5, y: 5 },
        spritesheet: "villager.png",
        direction: "down" as const,
      };

      act(() => {
        useProjectStore.getState().addNPC(mapId, npc);
      });

      const map = useProjectStore.getState().getMap(mapId);
      expect(map?.npcs).toHaveLength(1);
      expect(map?.npcs[0].name).toBe("Villager");
    });

    it("should update an NPC", () => {
      const npc = {
        id: "npc-1",
        name: "Original",
        position: { x: 5, y: 5 },
        spritesheet: "sprite.png",
        direction: "down" as const,
      };

      act(() => {
        useProjectStore.getState().addNPC(mapId, npc);
        useProjectStore
          .getState()
          .updateNPC(mapId, "npc-1", { name: "Updated NPC" });
      });

      const map = useProjectStore.getState().getMap(mapId);
      expect(map?.npcs[0].name).toBe("Updated NPC");
    });

    it("should delete an NPC", () => {
      const npc = {
        id: "npc-1",
        name: "To Delete",
        position: { x: 5, y: 5 },
        spritesheet: "sprite.png",
        direction: "down" as const,
      };

      act(() => {
        useProjectStore.getState().addNPC(mapId, npc);
        useProjectStore.getState().deleteNPC(mapId, "npc-1");
      });

      const map = useProjectStore.getState().getMap(mapId);
      expect(map?.npcs).toHaveLength(0);
    });
  });

  describe("event management", () => {
    let mapId: string;

    beforeEach(() => {
      act(() => {
        useProjectStore.getState().createProject("Test Project");
      });
      mapId = useProjectStore.getState().project?.maps[0].id as string;
    });

    it("should add an event", () => {
      const event = {
        id: "event-1",
        name: "Treasure Chest",
        position: { x: 10, y: 10 },
        trigger: "action" as const,
      };

      act(() => {
        useProjectStore.getState().addEvent(mapId, event);
      });

      const map = useProjectStore.getState().getMap(mapId);
      expect(map?.events).toHaveLength(1);
      expect(map?.events[0].name).toBe("Treasure Chest");
    });

    it("should update an event", () => {
      const event = {
        id: "event-1",
        name: "Original",
        position: { x: 10, y: 10 },
        trigger: "action" as const,
      };

      act(() => {
        useProjectStore.getState().addEvent(mapId, event);
        useProjectStore
          .getState()
          .updateEvent(mapId, "event-1", { trigger: "touch" });
      });

      const map = useProjectStore.getState().getMap(mapId);
      expect(map?.events[0].trigger).toBe("touch");
    });

    it("should delete an event", () => {
      const event = {
        id: "event-1",
        name: "To Delete",
        position: { x: 10, y: 10 },
        trigger: "action" as const,
      };

      act(() => {
        useProjectStore.getState().addEvent(mapId, event);
        useProjectStore.getState().deleteEvent(mapId, "event-1");
      });

      const map = useProjectStore.getState().getMap(mapId);
      expect(map?.events).toHaveLength(0);
    });
  });

  describe("dirty state tracking", () => {
    beforeEach(() => {
      act(() => {
        useProjectStore.getState().createProject("Test Project");
      });
    });

    it("should mark as dirty on changes", () => {
      expect(useProjectStore.getState().isDirty).toBe(false);

      act(() => {
        useProjectStore.getState().updateProject({ name: "Changed" });
      });

      expect(useProjectStore.getState().isDirty).toBe(true);
    });

    it("should manually mark dirty", () => {
      act(() => {
        useProjectStore.getState().markDirty();
      });

      expect(useProjectStore.getState().isDirty).toBe(true);
    });

    it("should manually mark clean", () => {
      act(() => {
        useProjectStore.getState().markDirty();
        useProjectStore.getState().markClean();
      });

      expect(useProjectStore.getState().isDirty).toBe(false);
    });
  });
});
