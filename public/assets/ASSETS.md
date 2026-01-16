# Asset Documentation

This directory contains all game assets including tilesets, character sprites, and UI elements.

## Directory Structure

```
public/assets/
├── manifest.json          # Asset manifest listing all available assets
├── tilesets/              # Tileset images (16x16 tiles)
│   └── placeholder-tileset.png
├── sprites/
│   ├── characters/        # Player character sprites
│   │   └── player.png
│   ├── npcs/              # NPC character sprites
│   │   ├── npc-1.png
│   │   ├── npc-2.png
│   │   └── npc-3.png
│   └── ui/                # UI elements (future)
└── ASSETS.md              # This file
```

## Placeholder Assets

The included placeholder assets are auto-generated for development purposes. They follow the standard GBA sprite conventions:

- **Tilesets**: 16x16 pixel tiles, organized in 8x8 grids (128x128 pixels total)
- **Character Sprites**: 16x24 pixels per frame, 4 frames × 4 directions (64x96 pixels total)

## Adding Custom Assets

### Tilesets

1. Create a PNG image with 16x16 pixel tiles arranged in a grid
2. Place the file in `/public/assets/tilesets/`
3. Add an entry to `manifest.json`:

```json
{
  "id": "my-tileset",
  "name": "My Custom Tileset",
  "path": "/assets/tilesets/my-tileset.png",
  "tileWidth": 16,
  "tileHeight": 16,
  "columns": 8,
  "rows": 8,
  "tileCount": 64,
  "description": "Description of your tileset"
}
```

### Character Sprites

1. Create a sprite sheet with the following layout:
   - Row 0: Walking down (4 frames)
   - Row 1: Walking left (4 frames)
   - Row 2: Walking right (4 frames)
   - Row 3: Walking up (4 frames)
2. Place the file in `/public/assets/sprites/characters/` or `/public/assets/sprites/npcs/`
3. Add an entry to the appropriate section in `manifest.json`

## Recommended Free Resources

### Tilesets

- [OpenGameArt.org](https://opengameart.org/) - Free game art under various licenses
- [itch.io Game Assets](https://itch.io/game-assets/free) - Free and paid assets
- [Kenney.nl](https://kenney.nl/assets) - High-quality free assets (CC0)

### Character Sprites

- [Universal LPC Spritesheet Generator](https://sanderfrenken.github.io/Universal-LPC-Spritesheet-Character-Generator/) - Create custom character sprites
- [OpenGameArt - Characters](https://opengameart.org/art-search-advanced?keys=&field_art_type_tid%5B%5D=9) - Free character sprites

### GBA-Style Resources

- [The Spriters Resource](https://www.spriters-resource.com/) - Game sprite rips (check licensing)
- Note: Many sprites from commercial games are copyrighted. Only use for personal/educational projects or seek proper licensing.

## Asset Specifications

### GBA Screen Resolution
- Original GBA: 240×160 pixels
- This project uses 2x scale: 480×320 pixels display

### Tile Size
- Standard: 16×16 pixels
- This matches the original GBA tile size

### Character Sprite Size
- Width: 16 pixels
- Height: 24 pixels (to allow for taller characters)
- Animation: 4 frames per direction

## License & Credits

### Placeholder Assets
The placeholder assets included in this project are generated programmatically and are free to use under the project's license.

### Third-Party Assets
When using third-party assets, always:
1. Check the license terms
2. Provide proper attribution
3. Add credits to this file

---

## Credits

| Asset | Author | License | Source |
|-------|--------|---------|--------|
| Placeholder Tileset | Auto-generated | MIT | This project |
| Placeholder Characters | Auto-generated | MIT | This project |

*Add your asset credits here when using third-party resources.*
