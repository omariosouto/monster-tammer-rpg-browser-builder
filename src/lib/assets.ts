import { z } from "zod";

// ============================================================================
// Asset Manifest Types
// ============================================================================

const AnimationSchema = z.object({
  row: z.number().int().nonnegative(),
  frames: z.number().int().positive(),
  speed: z.number().int().positive(),
});

const TilesetAssetSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  path: z.string().min(1),
  tileWidth: z.number().int().positive(),
  tileHeight: z.number().int().positive(),
  columns: z.number().int().positive(),
  rows: z.number().int().positive(),
  tileCount: z.number().int().nonnegative(),
  description: z.string().optional(),
});

const SpriteAssetSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  path: z.string().min(1),
  frameWidth: z.number().int().positive(),
  frameHeight: z.number().int().positive(),
  animations: z.record(z.string(), AnimationSchema),
  description: z.string().optional(),
});

const AssetManifestSchema = z.object({
  version: z.string(),
  tilesets: z.array(TilesetAssetSchema),
  sprites: z.object({
    characters: z.array(SpriteAssetSchema),
    npcs: z.array(SpriteAssetSchema),
  }),
});

export type Animation = z.infer<typeof AnimationSchema>;
export type TilesetAsset = z.infer<typeof TilesetAssetSchema>;
export type SpriteAsset = z.infer<typeof SpriteAssetSchema>;
export type AssetManifest = z.infer<typeof AssetManifestSchema>;

// ============================================================================
// Asset Loader
// ============================================================================

let cachedManifest: AssetManifest | null = null;

export async function loadAssetManifest(): Promise<AssetManifest> {
  if (cachedManifest) {
    return cachedManifest;
  }

  const response = await fetch("/assets/manifest.json");
  if (!response.ok) {
    throw new Error(`Failed to load asset manifest: ${response.statusText}`);
  }

  const data = await response.json();
  cachedManifest = AssetManifestSchema.parse(data);
  return cachedManifest;
}

export function getTileset(
  manifest: AssetManifest,
  id: string,
): TilesetAsset | undefined {
  return manifest.tilesets.find((t) => t.id === id);
}

export function getCharacterSprite(
  manifest: AssetManifest,
  id: string,
): SpriteAsset | undefined {
  return manifest.sprites.characters.find((s) => s.id === id);
}

export function getNPCSprite(
  manifest: AssetManifest,
  id: string,
): SpriteAsset | undefined {
  return manifest.sprites.npcs.find((s) => s.id === id);
}

export function getAllTilesets(manifest: AssetManifest): TilesetAsset[] {
  return manifest.tilesets;
}

export function getAllCharacterSprites(manifest: AssetManifest): SpriteAsset[] {
  return manifest.sprites.characters;
}

export function getAllNPCSprites(manifest: AssetManifest): SpriteAsset[] {
  return manifest.sprites.npcs;
}

// ============================================================================
// Preload Utilities
// ============================================================================

export async function preloadImage(path: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${path}`));
    img.src = path;
  });
}

export async function preloadAllAssets(
  manifest: AssetManifest,
): Promise<Map<string, HTMLImageElement>> {
  const images = new Map<string, HTMLImageElement>();

  const paths = [
    ...manifest.tilesets.map((t) => t.path),
    ...manifest.sprites.characters.map((s) => s.path),
    ...manifest.sprites.npcs.map((s) => s.path),
  ];

  await Promise.all(
    paths.map(async (path) => {
      const img = await preloadImage(path);
      images.set(path, img);
    }),
  );

  return images;
}
