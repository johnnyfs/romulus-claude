#!/usr/bin/env python3
"""
Create missing sprite assets for MITOSIS PANIC
Graphics Engineer - Claude Agent
"""

from PIL import Image

# Color definitions (RGB values)
TRANSPARENT = (0, 0, 0, 0)
CYAN = (0, 200, 255, 255)
LIGHT_CYAN = (128, 228, 255, 255)
DARK_CYAN = (0, 136, 170, 255)

RED = (255, 0, 0, 255)
DARK_RED = (192, 0, 0, 255)
BLACK = (0, 0, 0, 255)

GREEN = (0, 255, 0, 255)
PINK = (255, 0, 128, 255)
YELLOW = (255, 255, 0, 255)

WHITE = (255, 255, 255, 255)
GRAY = (128, 128, 128, 255)
LIGHT_GRAY = (192, 192, 192, 255)
DARK_GRAY = (64, 64, 64, 255)

BLUE_PURPLE = (96, 96, 192, 255)
LIGHT_BLUE = (128, 128, 255, 255)

def create_cell_frame_3():
    """Create cell_8x8_f3.png - contracted breathing frame"""
    img = Image.new('RGBA', (8, 8), TRANSPARENT)
    pixels = img.load()

    # Frame 3 pattern (contracted)
    pattern = [
        ['.', '.', '.', '.', '.', '.', '.', '.'],
        ['.', '.', 'C', 'C', 'C', 'C', '.', '.'],
        ['.', 'C', 'L', 'L', 'L', 'C', '.', '.'],
        ['.', 'C', 'L', 'D', 'D', 'C', '.', '.'],
        ['.', 'C', 'L', 'D', 'D', 'C', '.', '.'],
        ['.', 'C', 'L', 'L', 'L', 'C', '.', '.'],
        ['.', '.', 'C', 'C', 'C', '.', '.', '.'],
        ['.', '.', '.', '.', '.', '.', '.', '.'],
    ]

    color_map = {
        '.': TRANSPARENT,
        'C': CYAN,
        'L': LIGHT_CYAN,
        'D': DARK_CYAN
    }

    for y in range(8):
        for x in range(8):
            pixels[x, y] = color_map[pattern[y][x]]

    return img

def create_cell_frame_4():
    """Create cell_8x8_f4.png - expanding frame (same as frame 2)"""
    img = Image.new('RGBA', (8, 8), TRANSPARENT)
    pixels = img.load()

    # Frame 4 pattern (expanding - same as frame 2)
    pattern = [
        ['.', '.', 'C', 'C', 'C', 'C', '.', '.'],
        ['.', 'C', 'L', 'L', 'L', 'C', '.', '.'],
        ['C', 'L', 'L', 'L', 'L', 'L', 'C', '.'],
        ['C', 'L', 'L', 'D', 'D', 'L', 'C', '.'],
        ['C', 'L', 'L', 'D', 'D', 'L', 'C', '.'],
        ['C', 'L', 'L', 'L', 'L', 'L', 'C', '.'],
        ['.', 'C', 'C', 'L', 'L', 'C', '.', '.'],
        ['.', '.', 'C', 'C', 'C', '.', '.', '.'],
    ]

    color_map = {
        '.': TRANSPARENT,
        'C': CYAN,
        'L': LIGHT_CYAN,
        'D': DARK_CYAN
    }

    for y in range(8):
        for x in range(8):
            pixels[x, y] = color_map[pattern[y][x]]

    return img

def create_background_tiles():
    """Create background_tiles.png - petri dish arena tiles"""
    # Create a 128x128 image with 16x16 tiles (16 tiles total)
    img = Image.new('RGBA', (128, 128), TRANSPARENT)
    pixels = img.load()

    # Tile 0: Empty culture medium (light blue)
    for y in range(8):
        for x in range(8):
            pixels[x, y] = LIGHT_BLUE

    # Tile 1: Culture medium with subtle darker variation
    for y in range(8):
        for x in range(8):
            pixels[x + 8, y] = BLUE_PURPLE

    # Tile 2: Petri dish border (curved - top left)
    for y in range(8):
        for x in range(8):
            if x < 3 or y < 3:
                pixels[x + 16, y] = GRAY
            else:
                pixels[x + 16, y] = LIGHT_BLUE

    # Tile 3: Petri dish border (curved - top right)
    for y in range(8):
        for x in range(8):
            if x > 4 or y < 3:
                pixels[x + 24, y] = GRAY
            else:
                pixels[x + 24, y] = LIGHT_BLUE

    # Tile 4: Petri dish border (curved - bottom left)
    for y in range(8):
        for x in range(8):
            if x < 3 or y > 4:
                pixels[x + 32, y] = GRAY
            else:
                pixels[x + 32, y] = LIGHT_BLUE

    # Tile 5: Petri dish border (curved - bottom right)
    for y in range(8):
        for x in range(8):
            if x > 4 or y > 4:
                pixels[x + 40, y] = GRAY
            else:
                pixels[x + 40, y] = LIGHT_BLUE

    # Tile 6: Horizontal border (top)
    for y in range(8):
        for x in range(8):
            if y < 2:
                pixels[x + 48, y] = GRAY
            else:
                pixels[x + 48, y] = LIGHT_BLUE

    # Tile 7: Horizontal border (bottom)
    for y in range(8):
        for x in range(8):
            if y > 5:
                pixels[x + 56, y] = GRAY
            else:
                pixels[x + 56, y] = LIGHT_BLUE

    # Tile 8: Vertical border (left)
    for y in range(8):
        for x in range(8):
            if x < 2:
                pixels[x + 64, y] = GRAY
            else:
                pixels[x + 64, y] = LIGHT_BLUE

    # Tile 9: Vertical border (right)
    for y in range(8):
        for x in range(8):
            if x > 5:
                pixels[x + 72, y] = GRAY
            else:
                pixels[x + 72, y] = LIGHT_BLUE

    # Tile 10: Grid marking (horizontal line)
    for y in range(8):
        for x in range(8):
            if y == 3 or y == 4:
                pixels[x + 80, y] = DARK_GRAY
            else:
                pixels[x + 80, y] = LIGHT_BLUE

    # Tile 11: Grid marking (vertical line)
    for y in range(8):
        for x in range(8):
            if x == 3 or x == 4:
                pixels[x + 88, y] = DARK_GRAY
            else:
                pixels[x + 88, y] = LIGHT_BLUE

    # Fill remaining tiles with variations
    for tile in range(12, 16):
        tile_x = (tile % 16) * 8
        tile_y = (tile // 16) * 8
        for y in range(8):
            for x in range(8):
                pixels[tile_x + x, tile_y + y] = LIGHT_BLUE

    return img

def create_ui_font():
    """Create ui_font.png - 8x8 digit font for score display"""
    # Create a 80x8 image for digits 0-9
    img = Image.new('RGBA', (80, 8), TRANSPARENT)
    pixels = img.load()

    # Define 8x8 digit patterns (each string must be exactly 8 chars)
    digits = {
        '0': [
            "  ####  ",
            " ##  ## ",
            " ##  ## ",
            " ## ### ",
            " ### ## ",
            " ##  ## ",
            "  ####  ",
            "        "
        ],
        '1': [
            "   ##   ",
            "  ###   ",
            " ####   ",
            "   ##   ",
            "   ##   ",
            "   ##   ",
            " ###### ",
            "        "
        ],
        '2': [
            "  ####  ",
            " ##  ## ",
            "     ## ",
            "    ##  ",
            "   ##   ",
            "  ##    ",
            " ###### ",
            "        "
        ],
        '3': [
            "  ####  ",
            " ##  ## ",
            "     ## ",
            "   ###  ",
            "     ## ",
            " ##  ## ",
            "  ####  ",
            "        "
        ],
        '4': [
            "    ##  ",
            "   ###  ",
            "  ####  ",
            " ## ##  ",
            " ###### ",
            "    ##  ",
            "    ##  ",
            "        "
        ],
        '5': [
            " ###### ",
            " ##     ",
            " #####  ",
            "     ## ",
            "     ## ",
            " ##  ## ",
            "  ####  ",
            "        "
        ],
        '6': [
            "   ###  ",
            "  ##    ",
            " ##     ",
            " #####  ",
            " ##  ## ",
            " ##  ## ",
            "  ####  ",
            "        "
        ],
        '7': [
            " ###### ",
            "     ## ",
            "    ##  ",
            "   ##   ",
            "  ##    ",
            "  ##    ",
            "  ##    ",
            "        "
        ],
        '8': [
            "  ####  ",
            " ##  ## ",
            " ##  ## ",
            "  ####  ",
            " ##  ## ",
            " ##  ## ",
            "  ####  ",
            "        "
        ],
        '9': [
            "  ####  ",
            " ##  ## ",
            " ##  ## ",
            "  ##### ",
            "     ## ",
            "    ##  ",
            "  ###   ",
            "        "
        ],
    }

    for i, digit in enumerate('0123456789'):
        pattern = digits[digit]
        for y in range(8):
            for x in range(8):
                if x < len(pattern[y]) and pattern[y][x] == '#':
                    pixels[i * 8 + x, y] = WHITE
                else:
                    pixels[i * 8 + x, y] = TRANSPARENT

    return img

def main():
    """Generate all missing sprite assets"""
    print("Creating missing sprite assets...")

    # Create cell animation frames
    print("  - cell_8x8_f3.png")
    img_f3 = create_cell_frame_3()
    img_f3.save('assets/sprites/cell_8x8_f3.png')

    print("  - cell_8x8_f4.png")
    img_f4 = create_cell_frame_4()
    img_f4.save('assets/sprites/cell_8x8_f4.png')

    # Create background tiles
    print("  - background_tiles.png")
    img_bg = create_background_tiles()
    img_bg.save('assets/sprites/background_tiles.png')

    # Create UI font
    print("  - ui_font.png")
    img_font = create_ui_font()
    img_font.save('assets/sprites/ui_font.png')

    print("Sprite assets created successfully!")

if __name__ == '__main__':
    main()
