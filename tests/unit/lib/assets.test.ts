import { describe, expect, it } from "vitest";
import {
  type AssetManifest,
  getAllCharacterSprites,
  getAllNPCSprites,
  getAllTilesets,
  getCharacterSprite,
  getNPCSprite,
  getTileset,
} from "@/lib/assets";

const mockManifest: AssetManifest = {
  version: "1.0.0",
  tilesets: [
    {
      id: "tileset-1",
      name: "Test Tileset",
      path: "/assets/tilesets/test.png",
      tileWidth: 16,
      tileHeight: 16,
      columns: 8,
      rows: 8,
      tileCount: 64,
    },
    {
      id: "tileset-2",
      name: "Another Tileset",
      path: "/assets/tilesets/another.png",
      tileWidth: 16,
      tileHeight: 16,
      columns: 4,
      rows: 4,
      tileCount: 16,
    },
  ],
  sprites: {
    characters: [
      {
        id: "player",
        name: "Player",
        path: "/assets/sprites/characters/player.png",
        frameWidth: 16,
        frameHeight: 24,
        animations: {
          walk_down: { row: 0, frames: 4, speed: 8 },
          walk_up: { row: 3, frames: 4, speed: 8 },
        },
      },
    ],
    npcs: [
      {
        id: "npc-1",
        name: "NPC 1",
        path: "/assets/sprites/npcs/npc-1.png",
        frameWidth: 16,
        frameHeight: 24,
        animations: {
          walk_down: { row: 0, frames: 4, speed: 8 },
        },
      },
      {
        id: "npc-2",
        name: "NPC 2",
        path: "/assets/sprites/npcs/npc-2.png",
        frameWidth: 16,
        frameHeight: 24,
        animations: {
          walk_down: { row: 0, frames: 4, speed: 8 },
        },
      },
    ],
  },
};

describe("Asset Manifest Utilities", () => {
  describe("getTileset", () => {
    it("should return tileset by id", () => {
      const tileset = getTileset(mockManifest, "tileset-1");
      expect(tileset).toBeDefined();
      expect(tileset?.name).toBe("Test Tileset");
    });

    it("should return undefined for non-existent id", () => {
      const tileset = getTileset(mockManifest, "nonexistent");
      expect(tileset).toBeUndefined();
    });
  });

  describe("getCharacterSprite", () => {
    it("should return character sprite by id", () => {
      const sprite = getCharacterSprite(mockManifest, "player");
      expect(sprite).toBeDefined();
      expect(sprite?.name).toBe("Player");
    });

    it("should return undefined for non-existent id", () => {
      const sprite = getCharacterSprite(mockManifest, "nonexistent");
      expect(sprite).toBeUndefined();
    });
  });

  describe("getNPCSprite", () => {
    it("should return NPC sprite by id", () => {
      const sprite = getNPCSprite(mockManifest, "npc-1");
      expect(sprite).toBeDefined();
      expect(sprite?.name).toBe("NPC 1");
    });

    it("should return undefined for non-existent id", () => {
      const sprite = getNPCSprite(mockManifest, "nonexistent");
      expect(sprite).toBeUndefined();
    });
  });

  describe("getAllTilesets", () => {
    it("should return all tilesets", () => {
      const tilesets = getAllTilesets(mockManifest);
      expect(tilesets).toHaveLength(2);
    });
  });

  describe("getAllCharacterSprites", () => {
    it("should return all character sprites", () => {
      const sprites = getAllCharacterSprites(mockManifest);
      expect(sprites).toHaveLength(1);
    });
  });

  describe("getAllNPCSprites", () => {
    it("should return all NPC sprites", () => {
      const sprites = getAllNPCSprites(mockManifest);
      expect(sprites).toHaveLength(2);
    });
  });
});

describe("Asset Manifest Validation", () => {
  it("should have valid tileset structure", () => {
    for (const tileset of mockManifest.tilesets) {
      expect(tileset.id).toBeTruthy();
      expect(tileset.name).toBeTruthy();
      expect(tileset.path).toBeTruthy();
      expect(tileset.tileWidth).toBeGreaterThan(0);
      expect(tileset.tileHeight).toBeGreaterThan(0);
      expect(tileset.columns).toBeGreaterThan(0);
      expect(tileset.rows).toBeGreaterThan(0);
      expect(tileset.tileCount).toBeGreaterThanOrEqual(0);
    }
  });

  it("should have valid sprite structure", () => {
    const allSprites = [
      ...mockManifest.sprites.characters,
      ...mockManifest.sprites.npcs,
    ];

    for (const sprite of allSprites) {
      expect(sprite.id).toBeTruthy();
      expect(sprite.name).toBeTruthy();
      expect(sprite.path).toBeTruthy();
      expect(sprite.frameWidth).toBeGreaterThan(0);
      expect(sprite.frameHeight).toBeGreaterThan(0);
      expect(Object.keys(sprite.animations).length).toBeGreaterThan(0);
    }
  });

  it("should have valid animation structure", () => {
    const allSprites = [
      ...mockManifest.sprites.characters,
      ...mockManifest.sprites.npcs,
    ];

    for (const sprite of allSprites) {
      for (const [, anim] of Object.entries(sprite.animations)) {
        expect(anim.row).toBeGreaterThanOrEqual(0);
        expect(anim.frames).toBeGreaterThan(0);
        expect(anim.speed).toBeGreaterThan(0);
      }
    }
  });
});
