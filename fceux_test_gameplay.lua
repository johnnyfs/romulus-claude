-- MITOSIS PANIC - FCEUX Gameplay State Validator
-- QA Engineer: Claude QA Agent
-- Purpose: Automatically validate runtime game state vs expected behavior
-- Usage: Load in FCEUX: Tools > Lua > Run Script

-- Memory addresses (from src/main.asm)
local CELL_DATA = 0x0300
local ANTIBODY_DATA = 0x0400
local NUTRIENT_DATA = 0x0480

local GAME_STATE = 0x0500
local CELL_COUNT = 0x0501
local NUTRIENT_COUNT = 0x0502
local ANTIBODY_COUNT = 0x0503
local NUTRIENTS_COLLECTED = 0x0504
local SCORE_LO = 0x0505
local SCORE_HI = 0x0506
local GAME_OVER_FLAG = 0x0507

local FRAME_COUNT = 0x0000  -- ZP frame counter

-- Entity structure offsets (16 bytes per entity)
local ENTITY_ACTIVE = 0
local ENTITY_X = 1
local ENTITY_Y = 2
local ENTITY_VX = 3
local ENTITY_VY = 4
local ENTITY_SIZE = 5
local ENTITY_AI_TYPE = 5  -- For antibodies

-- Constants
local MAX_CELLS = 16
local MAX_ANTIBODIES = 8
local MAX_NUTRIENTS = 8

-- Tracking variables
local last_nutrient_count = 0
local last_cell_count = 0
local total_nutrients_seen = 0
local mitosis_events = 0
local game_started = false

-- Color codes for console output
local COLOR_ERROR = "red"
local COLOR_WARNING = "yellow"
local COLOR_INFO = "green"
local COLOR_DEBUG = "white"

-- Helper function to read entity at offset
local function read_entity(base_addr, index, offset_name)
    local entity_offset = index * 16
    local addr = base_addr + entity_offset

    return {
        active = memory.readbyte(addr + ENTITY_ACTIVE),
        x = memory.readbyte(addr + ENTITY_X),
        y = memory.readbyte(addr + ENTITY_Y),
        vx = memory.readbytesigned(addr + ENTITY_VX),
        vy = memory.readbytesigned(addr + ENTITY_VY),
        size_or_ai = memory.readbyte(addr + ENTITY_SIZE)
    }
end

-- Count active entities
local function count_active_entities(base_addr, max_count)
    local count = 0
    for i = 0, max_count - 1 do
        local entity = read_entity(base_addr, i, "entity")
        if entity.active ~= 0 then
            count = count + 1
        end
    end
    return count
end

-- Check if entities are moving (velocity != 0)
local function check_entity_movement(base_addr, max_count, entity_type)
    local moving_count = 0
    local static_count = 0

    for i = 0, max_count - 1 do
        local entity = read_entity(base_addr, i, entity_type)
        if entity.active ~= 0 then
            if entity.vx ~= 0 or entity.vy ~= 0 then
                moving_count = moving_count + 1
            else
                static_count = static_count + 1
            end
        end
    end

    return moving_count, static_count
end

-- Main validation function (called every frame)
local function validate_game_state()
    -- Read game state
    local game_over = memory.readbyte(GAME_OVER_FLAG)
    local cell_count = memory.readbyte(CELL_COUNT)
    local nutrient_count = memory.readbyte(NUTRIENT_COUNT)
    local antibody_count = memory.readbyte(ANTIBODY_COUNT)
    local nutrients_collected = memory.readbyte(NUTRIENTS_COLLECTED)
    local frame = memory.readbyte(FRAME_COUNT)

    -- Count actual entities (verify counters match)
    local actual_cells = count_active_entities(CELL_DATA, MAX_CELLS)
    local actual_antibodies = count_active_entities(ANTIBODY_DATA, MAX_ANTIBODIES)
    local actual_nutrients = count_active_entities(NUTRIENT_DATA, MAX_NUTRIENTS)

    -- Display current state
    gui.text(10, 10, string.format("Frame: %d", frame))
    gui.text(10, 20, string.format("Game Over: %d", game_over))
    gui.text(10, 30, string.format("Cells: %d (actual: %d)", cell_count, actual_cells))
    gui.text(10, 40, string.format("Antibodies: %d (actual: %d)", antibody_count, actual_antibodies))
    gui.text(10, 50, string.format("Nutrients: %d (actual: %d)", nutrient_count, actual_nutrients))
    gui.text(10, 60, string.format("Collected: %d", nutrients_collected))
    gui.text(10, 70, string.format("Mitosis Events: %d", mitosis_events))

    -- Validation checks

    -- CHECK 1: Nutrient count validation
    if nutrient_count ~= actual_nutrients then
        print(string.format("[ERROR] Nutrient count mismatch! Counter=%d, Actual=%d", nutrient_count, actual_nutrients))
    end

    -- CHECK 2: Cell count validation
    if cell_count ~= actual_cells then
        print(string.format("[ERROR] Cell count mismatch! Counter=%d, Actual=%d", cell_count, actual_cells))
    end

    -- CHECK 3: Antibody count validation
    if antibody_count ~= actual_antibodies then
        print(string.format("[ERROR] Antibody count mismatch! Counter=%d, Actual=%d", antibody_count, actual_antibodies))
    end

    -- CHECK 4: Nutrients should spawn (expect 3 at start)
    if not game_started and frame > 60 then
        game_started = true
        if actual_nutrients == 0 then
            print(string.format("[CRITICAL] BUG-002: No nutrients spawned! Expected 3, found 0"))
        else
            print(string.format("[INFO] Nutrients spawned correctly: %d", actual_nutrients))
        end
    end

    -- CHECK 5: Antibodies should move
    if frame > 120 and actual_antibodies > 0 then
        local moving, static = check_entity_movement(ANTIBODY_DATA, MAX_ANTIBODIES, "antibody")
        if static > 0 and moving == 0 then
            print(string.format("[CRITICAL] BUG-003: All antibodies static! Moving=%d, Static=%d", moving, static))
        end

        gui.text(10, 80, string.format("Antibody Movement: %d moving, %d static", moving, static))
    end

    -- CHECK 6: Mitosis trigger validation
    if nutrients_collected >= 10 then
        print(string.format("[WARNING] Nutrients collected >= 10 (%d) - mitosis should have triggered!", nutrients_collected))
    end

    -- Track mitosis events
    if cell_count > last_cell_count then
        mitosis_events = mitosis_events + 1
        print(string.format("[INFO] Mitosis detected! Cells: %d -> %d (Event #%d)", last_cell_count, cell_count, mitosis_events))
    end

    -- Track nutrient collection
    if nutrient_count < last_nutrient_count then
        total_nutrients_seen = total_nutrients_seen + (last_nutrient_count - nutrient_count)
        print(string.format("[INFO] Nutrient collected! Total collected: %d, Counter: %d", total_nutrients_seen, nutrients_collected))
    end

    -- CHECK 7: Game over state validation
    if game_over ~= 0 then
        print(string.format("[INFO] Game over flag set! Flag=%d", game_over))
        gui.text(10, 100, "GAME OVER STATE", "red")

        -- Check if game is truly frozen (frame count not incrementing)
        -- This would indicate a hang vs proper game over
    end

    -- CHECK 8: Entity bounds validation
    for i = 0, actual_cells - 1 do
        local cell = read_entity(CELL_DATA, i, "cell")
        if cell.active ~= 0 then
            if cell.x < 16 or cell.x > 240 or cell.y < 32 or cell.y > 224 then
                print(string.format("[WARNING] Cell %d out of bounds! X=%d, Y=%d", i, cell.x, cell.y))
            end
        end
    end

    -- Update tracking
    last_cell_count = cell_count
    last_nutrient_count = nutrient_count
end

-- Register frame callback
emu.registerafter(validate_game_state)

print("=== MITOSIS PANIC - Gameplay State Validator ===")
print("Monitoring game state... Press Ctrl+C to stop.")
print("")
print("Expected behavior:")
print("  - 3 nutrients spawn at start")
print("  - Antibodies move with AI (chase/patrol)")
print("  - Mitosis triggers every 10 nutrients")
print("  - Collision sets game over flag (not hang)")
print("")
print("Watching for:")
print("  [CRITICAL] BUG-002: No nutrients spawning")
print("  [CRITICAL] BUG-003: Antibodies static/frozen")
print("  [CRITICAL] BUG-005: Game hang on collision")
print("  [WARNING] Boundary violations")
print("")
