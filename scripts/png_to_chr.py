#!/usr/bin/env python3
"""
Convert PNG sprites to NES CHR-ROM format
Graphics Engineer - Claude Agent

NES CHR-ROM format:
- 8KB file containing 512 tiles (256 pattern table 0, 256 pattern table 1)
- Each tile is 8x8 pixels, 2bpp (bits per pixel)
- Each tile takes 16 bytes: 8 bytes plane 0, 8 bytes plane 1
- Colors are 2-bit indices: 00, 01, 10, 11 (0-3 in palette)
"""

from PIL import Image
import struct
import os

def rgb_to_nes_palette_index(rgba):
    """
    Convert RGBA color to NES 2-bit palette index (0-3)
    0 = transparent/background
    1-3 = sprite colors
    """
    r, g, b, a = rgba

    # Fully transparent = 0
    if a < 128:
        return 0

    # Calculate brightness to determine palette index
    brightness = (r + g + b) / 3

    # Simple brightness-based mapping
    if brightness < 64:
        return 0  # Dark/transparent
    elif brightness < 128:
        return 1  # Darkest color
    elif brightness < 192:
        return 2  # Medium color
    else:
        return 3  # Brightest color

def png_to_chr_tile(img, tile_x=0, tile_y=0):
    """
    Convert an 8x8 region of a PNG to NES CHR tile format (16 bytes)
    Returns 16 bytes: 8 bytes plane 0, 8 bytes plane 1
    """
    if img.mode != 'RGBA':
        img = img.convert('RGBA')

    pixels = img.load()
    tile_data = bytearray(16)

    # Process each row of the 8x8 tile
    for row in range(8):
        plane0_byte = 0
        plane1_byte = 0

        for col in range(8):
            x = tile_x * 8 + col
            y = tile_y * 8 + row

            # Get pixel color and convert to palette index
            if x < img.width and y < img.height:
                rgba = pixels[x, y]
                color_index = rgb_to_nes_palette_index(rgba)
            else:
                color_index = 0  # Out of bounds = transparent

            # Extract bits for each plane
            bit0 = (color_index >> 0) & 1
            bit1 = (color_index >> 1) & 1

            # Pack bits into bytes (MSB first)
            plane0_byte = (plane0_byte << 1) | bit0
            plane1_byte = (plane1_byte << 1) | bit1

        # Store the bytes for this row
        tile_data[row] = plane0_byte
        tile_data[row + 8] = plane1_byte

    return bytes(tile_data)

def load_sprite_as_tiles(sprite_path, num_tiles_x=1, num_tiles_y=1):
    """
    Load a PNG sprite and convert it to CHR tile data
    Returns list of tile data (16 bytes each)
    """
    if not os.path.exists(sprite_path):
        print(f"  Warning: {sprite_path} not found, filling with empty tiles")
        return [bytes(16) for _ in range(num_tiles_x * num_tiles_y)]

    img = Image.open(sprite_path)
    tiles = []

    for ty in range(num_tiles_y):
        for tx in range(num_tiles_x):
            tile_data = png_to_chr_tile(img, tx, ty)
            tiles.append(tile_data)

    return tiles

def create_chr_rom():
    """
    Create the complete 8KB CHR-ROM file from all sprite assets

    CHR-ROM layout (512 tiles total):
    Pattern Table 0 (tiles 0x00-0xFF):
      0x00-0x0F: Player cell frames (4 frames × 1 tile each = 4 tiles)
      0x10-0x1F: Antibody sprites (4 types × 1 tile each = 4 tiles)
      0x20-0x2F: Nutrient sprites (3 colors × 2 frames = 6 tiles)
      0x30-0x3F: UI font digits (10 digits = 10 tiles)
      0x40-0x7F: Background tiles (64 tiles)
      0x80-0xFF: Reserved for future sprites

    Pattern Table 1 (tiles 0x100-0x1FF):
      Reserved for future expansion
    """
    chr_rom = bytearray(8192)  # 8KB = 8192 bytes = 512 tiles × 16 bytes
    tile_index = 0

    def write_tiles(tiles, description):
        nonlocal tile_index
        print(f"  Writing {len(tiles)} tiles at 0x{tile_index:02X}: {description}")
        for tile in tiles:
            offset = tile_index * 16
            chr_rom[offset:offset+16] = tile
            tile_index += 1

    print("Building CHR-ROM from sprites...")

    # Player cell sprites (4 animation frames)
    cell_tiles = []
    for frame in range(1, 5):
        sprite_path = f'assets/sprites/cell_8x8_f{frame}.png'
        tiles = load_sprite_as_tiles(sprite_path, 1, 1)
        cell_tiles.extend(tiles)
    write_tiles(cell_tiles, "Player cell animation (4 frames)")

    # Antibody sprites (1 type for now, expand later)
    antibody_tiles = load_sprite_as_tiles('assets/sprites/antibody_8x8_f1.png', 1, 1)
    # Duplicate for 4 types (placeholders)
    antibody_tiles = antibody_tiles * 4
    write_tiles(antibody_tiles, "Antibody sprites (4 types)")

    # Nutrient sprites (3 colors)
    nutrient_tiles = []
    for color in ['green', 'pink', 'yellow']:
        sprite_path = f'assets/sprites/nutrient_{color}_f1.png'
        tiles = load_sprite_as_tiles(sprite_path, 1, 1)
        nutrient_tiles.extend(tiles)
        # Add frame 2 (duplicate for now)
        nutrient_tiles.extend(tiles)
    write_tiles(nutrient_tiles, "Nutrient sprites (3 colors × 2 frames)")

    # UI font (10 digits)
    ui_font_tiles = load_sprite_as_tiles('assets/sprites/ui_font.png', 10, 1)
    write_tiles(ui_font_tiles, "UI font (digits 0-9)")

    # Background tiles
    bg_tiles = load_sprite_as_tiles('assets/sprites/background_tiles.png', 16, 16)
    # Take first 64 tiles
    write_tiles(bg_tiles[:64], "Background tiles (petri dish arena)")

    # Fill remaining Pattern Table 0 with empty tiles
    remaining_pt0 = 256 - tile_index
    if remaining_pt0 > 0:
        empty_tiles = [bytes(16) for _ in range(remaining_pt0)]
        write_tiles(empty_tiles, f"Empty tiles (reserved)")

    # Pattern Table 1 - fill with empty tiles
    empty_tiles = [bytes(16) for _ in range(256)]
    write_tiles(empty_tiles, "Pattern Table 1 (reserved)")

    print(f"CHR-ROM size: {len(chr_rom)} bytes ({len(chr_rom)/1024:.1f} KB)")
    return bytes(chr_rom)

def main():
    """Generate CHR-ROM file from all sprite assets"""
    # Ensure graphics directory exists
    os.makedirs('graphics', exist_ok=True)

    # Create CHR-ROM
    chr_data = create_chr_rom()

    # Write to file
    output_path = 'graphics/game.chr'
    with open(output_path, 'wb') as f:
        f.write(chr_data)

    print(f"\nCHR-ROM written to {output_path}")
    print(f"File size: {len(chr_data)} bytes (exactly 8KB for NES)")

    # Verify file size
    if len(chr_data) == 8192:
        print("✓ CHR-ROM size is correct (8192 bytes)")
    else:
        print(f"✗ WARNING: CHR-ROM size is {len(chr_data)} bytes (expected 8192)")

if __name__ == '__main__':
    main()
