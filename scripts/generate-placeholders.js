/**
 * Generate placeholder sprite assets for development
 * Run with: node scripts/generate-placeholders.js
 */

import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const TILE_SIZE = 16;
const COLORS = {
  grass: "#4a7c59",
  water: "#4a90d9",
  sand: "#d4a76a",
  stone: "#7a7a7a",
  path: "#c4a86a",
  tree: "#2d5a27",
  flower: "#e35d6a",
  house: "#8b4513",
};

const CHARACTER_COLORS = {
  player: "#3498db",
  npc1: "#e74c3c",
  npc2: "#2ecc71",
  npc3: "#9b59b6",
};

async function createTileset() {
  const cols = 8;
  const rows = 8;
  const width = cols * TILE_SIZE;
  const height = rows * TILE_SIZE;

  // Create a simple tileset with colored squares
  const colorList = Object.values(COLORS);
  const tiles = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const colorIndex = (row * cols + col) % colorList.length;
      const color = colorList[colorIndex];

      // Create a tile with slight variation
      const variation = ((row + col) % 3) * 10;
      tiles.push({
        input: Buffer.from(
          `<svg width="${TILE_SIZE}" height="${TILE_SIZE}">
            <rect width="${TILE_SIZE}" height="${TILE_SIZE}" fill="${color}"/>
            <rect x="1" y="1" width="${TILE_SIZE - 2}" height="${TILE_SIZE - 2}"
                  fill="${color}" opacity="0.${80 + variation}"/>
          </svg>`,
        ),
        top: row * TILE_SIZE,
        left: col * TILE_SIZE,
      });
    }
  }

  const tileset = await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite(tiles)
    .png()
    .toBuffer();

  return tileset;
}

async function createCharacterSprite(color) {
  // 4 directions (down, left, right, up) x 4 frames = 16 sprites
  // Each sprite is 16x24 pixels
  const spriteWidth = 16;
  const spriteHeight = 24;
  const cols = 4; // frames per direction
  const rows = 4; // directions
  const width = cols * spriteWidth;
  const height = rows * spriteHeight;

  const sprites = [];

  for (let dir = 0; dir < 4; dir++) {
    for (let frame = 0; frame < 4; frame++) {
      // Create a simple character silhouette
      const offsetX = frame % 2 === 1 ? 1 : 0; // Walking animation offset
      sprites.push({
        input: Buffer.from(
          `<svg width="${spriteWidth}" height="${spriteHeight}">
            <!-- Body -->
            <rect x="${4 + offsetX}" y="8" width="8" height="12" fill="${color}" rx="2"/>
            <!-- Head -->
            <circle cx="${8 + offsetX}" cy="5" r="4" fill="${color}"/>
            <!-- Direction indicator -->
            <circle cx="${8 + offsetX}" cy="${dir === 0 ? 6 : dir === 3 ? 4 : 5}"
                    r="1" fill="white" opacity="${dir < 2 ? 0.8 : 0.5}"/>
          </svg>`,
        ),
        top: dir * spriteHeight,
        left: frame * spriteWidth,
      });
    }
  }

  const sprite = await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite(sprites)
    .png()
    .toBuffer();

  return sprite;
}

async function main() {
  const baseDir = join(process.cwd(), "public/assets");

  console.log("Generating placeholder assets...\n");

  // Create tileset
  console.log("Creating tileset...");
  const tileset = await createTileset();
  await writeFile(join(baseDir, "tilesets/placeholder-tileset.png"), tileset);
  console.log("  ✓ tilesets/placeholder-tileset.png");

  // Create character sprites
  console.log("\nCreating character sprites...");
  for (const [name, color] of Object.entries(CHARACTER_COLORS)) {
    const sprite = await createCharacterSprite(color);
    const filename =
      name === "player" ? "player.png" : `${name.replace("npc", "npc-")}.png`;
    const dir = name === "player" ? "characters" : "npcs";
    await writeFile(join(baseDir, `sprites/${dir}/${filename}`), sprite);
    console.log(`  ✓ sprites/${dir}/${filename}`);
  }

  console.log("\n✓ Placeholder assets generated successfully!");
}

main().catch(console.error);
