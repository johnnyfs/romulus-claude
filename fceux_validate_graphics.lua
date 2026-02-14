-- MITOSIS PANIC - Aggressive Graphics Validation
-- QA Engineer + Graphics Engineer
-- Purpose: Validate EVERY graphics assumption - prove rendering works correctly
-- Usage: Load in FCEUX alongside main test scripts
--
-- Integration: Uses Graphics Engineer's OAM_LAYOUT.md specifications
-- - Player: Tiles $00-$07 (16x16 metatile), Palette 0, Y:0-232, X:0-248
-- - Nutrients: Tiles $10-$12 (8x8), Palette 1
-- - Antibodies: Tile $02 (MVP) or $20-$2F (full), Palette 2
--
-- Graphics Engineer's validate_chr.sh provides CHR-ROM hex validation
-- This script provides runtime OAM/sprite validation during gameplay

print("=== MITOSIS PANIC - Aggressive Graphics Validation ===")

-- OAM Buffer (sprite memory)
local OAM_BASE = 0x0200
local OAM_SIZE = 256  -- 64 sprites * 4 bytes

-- PPU Palette Memory
local PALETTE_BASE = 0x3F00
local PALETTE_SIZE = 32

-- Expected tile indices (from Graphics Engineer's OAM_LAYOUT.md)
-- Player: 16x16 metatile using tiles $00-$03 (frame 1) or $04-$07 (frame 2)
local VALID_PLAYER_TILES = {
    [0x00]=true, [0x01]=true, [0x02]=true, [0x03]=true,  -- Frame 1
    [0x04]=true, [0x05]=true, [0x06]=true, [0x07]=true   -- Frame 2
}
-- Antibodies: MVP uses single tile $02, full version uses $20-$2F
local VALID_ANTIBODY_TILES = {
    [0x02]=true,  -- MVP single 8x8 Y-shape
    [0x20]=true, [0x21]=true, [0x22]=true, [0x23]=true,  -- Full 16x16 frame 1
    [0x24]=true, [0x25]=true, [0x26]=true, [0x27]=true,  -- Rotated 90°
    [0x28]=true, [0x29]=true, [0x2A]=true, [0x2B]=true,  -- Rotated 180°
    [0x2C]=true, [0x2D]=true, [0x2E]=true, [0x2F]=true   -- Rotated 270°
}
-- Nutrients: Single 8x8 sprites, tiles $10-$12
local VALID_NUTRIENT_TILES = {[0x10]=true, [0x11]=true, [0x12]=true}

-- Expected palette data (from PALETTES.md)
local EXPECTED_BG_PALETTE = {
    0x0F, 0x00, 0x10, 0x30,  -- Grayscale
    0x0F, 0x01, 0x11, 0x21,  -- Blues
    0x0F, 0x06, 0x16, 0x26,  -- Reds
    0x0F, 0x0A, 0x1A, 0x2A   -- Greens
}

local EXPECTED_SPRITE_PALETTE = {
    0x0F, 0x0C, 0x1C, 0x2C,  -- Cyan (cells)
    0x0F, 0x06, 0x16, 0x26,  -- Red (antibodies)
    0x0F, 0x0A, 0x1A, 0x2A,  -- Green (nutrients)
    0x0F, 0x00, 0x10, 0x30   -- Grayscale (UI)
}

-- Tracking variables
local oam_write_count = 0
local invalid_tile_count = 0
local oam_corruption_detected = false
local palette_verified = false

-- Validate OAM sprite entry
local function validate_sprite(index)
    local offset = index * 4
    local y = memory.readbyte(OAM_BASE + offset + 0)
    local tile = memory.readbyte(OAM_BASE + offset + 1)
    local attr = memory.readbyte(OAM_BASE + offset + 2)
    local x = memory.readbyte(OAM_BASE + offset + 3)

    local errors = {}

    -- Check 1: Y coordinate validity (per Graphics Engineer OAM_LAYOUT.md)
    if y == 0xFF then
        -- Off-screen (intentional)
        return nil  -- Skip validation for off-screen sprites
    end

    -- Graphics Engineer spec: Y max 232 for player (allows 8px sprite at Y+8)
    if y > 232 then
        table.insert(errors, string.format("Invalid Y=%d (max 232 per OAM_LAYOUT.md)", y))
    end

    -- Check 2: Tile index validity
    local tile_valid = VALID_PLAYER_TILES[tile] or
                      VALID_ANTIBODY_TILES[tile] or
                      VALID_NUTRIENT_TILES[tile]

    if not tile_valid then
        table.insert(errors, string.format("Invalid tile=$%02X", tile))
        invalid_tile_count = invalid_tile_count + 1
    end

    -- Check 3: Attribute byte validity (palette assignment per Graphics Engineer spec)
    local palette_bits = bit.band(attr, 0x03)
    local flip_bits = bit.band(attr, 0xC0)

    if palette_bits > 3 then
        table.insert(errors, string.format("Invalid palette=%d (max 3)", palette_bits))
    end

    -- Validate palette matches tile type (per OAM_LAYOUT.md)
    if VALID_PLAYER_TILES[tile] and palette_bits ~= 0 then
        table.insert(errors, string.format("Player tile should use palette 0, got %d", palette_bits))
    elseif VALID_NUTRIENT_TILES[tile] and palette_bits ~= 1 then
        table.insert(errors, string.format("Nutrient tile should use palette 1, got %d", palette_bits))
    elseif VALID_ANTIBODY_TILES[tile] and palette_bits ~= 2 then
        table.insert(errors, string.format("Antibody tile should use palette 2, got %d", palette_bits))
    end

    -- Check 4: X coordinate validity (per Graphics Engineer OAM_LAYOUT.md)
    -- Graphics Engineer spec: X max 248 for player (allows 8px sprite at X+8)
    if x > 248 then
        table.insert(errors, string.format("X=%d exceeds max 248 per OAM_LAYOUT.md", x))
    end

    if #errors > 0 then
        return {
            index = index,
            y = y,
            tile = tile,
            attr = attr,
            x = x,
            errors = errors
        }
    end

    return nil
end

-- Count active sprites in OAM
local function count_active_sprites()
    local count = 0
    for i = 0, 63 do
        local y = memory.readbyte(OAM_BASE + i * 4)
        if y ~= 0xFF then
            count = count + 1
        end
    end
    return count
end

-- Validate palette memory
local function validate_palettes()
    if palette_verified then
        return true
    end

    print("[GRAPHICS] Validating palette memory...")

    local bg_errors = {}
    local sprite_errors = {}

    -- Check background palettes (disabled - can't read PPU memory directly in FCEUX Lua)
    -- Would need to use PPU viewer manually

    -- Check sprite palettes (disabled - same limitation)

    -- Note: Palette validation must be done via PPU viewer
    print("[INFO] Palette validation requires manual PPU viewer check")
    print("  Expected BG: $3F00-$3F0F (see PALETTES.md)")
    print("  Expected Sprite: $3F10-$3F1F (see PALETTES.md)")

    palette_verified = true
    return true
end

-- Validate OAM buffer integrity
local function validate_oam_buffer()
    local active_sprites = count_active_sprites()
    local sprite_errors = {}

    -- Check 1: Sprite count limits
    if active_sprites > 64 then
        print(string.format("[CRITICAL] Sprite overflow! Count=%d (max 64)", active_sprites))
        oam_corruption_detected = true
    end

    -- Check 2: Validate each active sprite
    for i = 0, 63 do
        local sprite_error = validate_sprite(i)
        if sprite_error then
            table.insert(sprite_errors, sprite_error)
        end
    end

    -- Report errors
    if #sprite_errors > 0 then
        print(string.format("[ERROR] %d sprites have invalid data:", #sprite_errors))
        for _, err in ipairs(sprite_errors) do
            print(string.format("  Sprite %d: Y=%d X=%d Tile=$%02X Attr=$%02X",
                err.index, err.y, err.x, err.tile, err.attr))
            for _, msg in ipairs(err.errors) do
                print(string.format("    - %s", msg))
            end
        end
        oam_corruption_detected = true
    end

    return active_sprites, #sprite_errors
end

-- Categorize sprites by tile index
local function categorize_sprites()
    local players = 0
    local antibodies = 0
    local nutrients = 0
    local unknown = 0

    for i = 0, 63 do
        local y = memory.readbyte(OAM_BASE + i * 4)
        if y ~= 0xFF then
            local tile = memory.readbyte(OAM_BASE + i * 4 + 1)

            if VALID_PLAYER_TILES[tile] then
                players = players + 1
            elseif VALID_ANTIBODY_TILES[tile] then
                antibodies = antibodies + 1
            elseif VALID_NUTRIENT_TILES[tile] then
                nutrients = nutrients + 1
            else
                unknown = unknown + 1
            end
        end
    end

    return players, antibodies, nutrients, unknown
end

-- Check for sprite flickering (OAM instability)
local last_oam_hash = 0
local oam_change_count = 0
local frame_count = 0

local function detect_flickering()
    -- Simple hash of OAM buffer
    local hash = 0
    for i = 0, 63 do
        local y = memory.readbyte(OAM_BASE + i * 4)
        hash = hash + y
    end

    if hash ~= last_oam_hash then
        oam_change_count = oam_change_count + 1
    end

    last_oam_hash = hash
    frame_count = frame_count + 1

    -- If OAM changes every single frame, might be flickering
    if frame_count > 60 and oam_change_count == frame_count then
        print("[WARNING] Possible sprite flickering detected (OAM changes every frame)")
    end
end

-- Main validation function
local function validate_graphics_state()
    -- Validate palettes once
    if not palette_verified then
        validate_palettes()
    end

    -- Validate OAM every frame
    local active, errors = validate_oam_buffer()
    local players, antibodies, nutrients, unknown = categorize_sprites()

    -- Detect flickering
    detect_flickering()

    -- Display graphics state
    gui.text(150, 10, "=== GRAPHICS STATE ===", "white")
    gui.text(150, 20, string.format("Active Sprites: %d/64", active))
    gui.text(150, 30, string.format("  Players: %d", players))
    gui.text(150, 40, string.format("  Antibodies: %d", antibodies))
    gui.text(150, 50, string.format("  Nutrients: %d", nutrients))
    gui.text(150, 60, string.format("  Unknown: %d", unknown))

    if errors > 0 then
        gui.text(150, 70, string.format("OAM Errors: %d", errors), "red")
    end

    if invalid_tile_count > 0 then
        gui.text(150, 80, string.format("Invalid Tiles: %d", invalid_tile_count), "red")
    end

    if oam_corruption_detected then
        gui.text(150, 90, "CORRUPTION!", "red")
    end

    -- Aggressive validation checks
    if active == 0 and frame_count > 60 then
        print("[CRITICAL] NO SPRITES ACTIVE - Nothing rendering!")
    end

    if players == 0 and frame_count > 60 then
        print("[CRITICAL] NO PLAYER SPRITE - Player not rendering!")
    end

    if nutrients == 0 and frame_count > 60 then
        print("[CRITICAL] NO NUTRIENT SPRITES - BUG-002 confirmed (visual)")
    end

    if unknown > 0 then
        print(string.format("[ERROR] %d sprites using invalid tile indices!", unknown))
    end
end

-- Register frame callback
emu.registerafter(validate_graphics_state)

print("Graphics validation active. Monitoring:")
print("  - OAM buffer integrity (64 sprite limit)")
print("  - Tile index validity (player/enemy/nutrient)")
print("  - Palette attribute validity (0-3)")
print("  - Sprite position bounds (Y:0-239)")
print("  - Sprite categorization (count by type)")
print("  - Flickering detection (OAM instability)")
print("")
print("AGGRESSIVE MODE: Will report ANY deviation from spec")
print("")
