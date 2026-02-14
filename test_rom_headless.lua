-- MITOSIS PANIC - Automated Headless Test Script
-- Runs game simulation and validates behavior without GUI
-- Can be run with: fceux --loadlua test_rom_headless.lua build/mitosis_panic.nes

print("=== MITOSIS PANIC - Automated Headless Test ===")
print("Starting automated validation...")
print("")

-- Memory addresses
local CELL_DATA = 0x0300
local ANTIBODY_DATA = 0x0400
local NUTRIENT_DATA = 0x0480
local cell_count = 0x0501
local nutrient_count = 0x0502
local antibody_count = 0x0503
local nutrients_collected = 0x0504
local game_over_flag = 0x0507

-- Test state
local test_frame = 0
local test_results = {}
local critical_failures = 0

-- Helper to record test result
local function record_test(name, passed, message)
    table.insert(test_results, {
        name = name,
        passed = passed,
        message = message or "",
        frame = test_frame
    })

    if not passed then
        critical_failures = critical_failures + 1
        print(string.format("[FAIL] %s: %s (frame %d)", name, message or "", test_frame))
    else
        print(string.format("[PASS] %s (frame %d)", name, test_frame))
    end
end

-- Count active entities
local function count_active(base_addr, max_count)
    local count = 0
    for i = 0, max_count - 1 do
        if memory.readbyte(base_addr + i * 16) ~= 0 then
            count = count + 1
        end
    end
    return count
end

-- Test suite
local tests_completed = false

local function run_tests()
    test_frame = test_frame + 1

    -- TEST 1: Initial state validation (frame 60)
    if test_frame == 60 and not tests_completed then
        local actual_cells = count_active(CELL_DATA, 16)
        local actual_nutrients = count_active(NUTRIENT_DATA, 8)
        local actual_antibodies = count_active(ANTIBODY_DATA, 8)

        record_test("Initial cell spawn", actual_cells == 1,
            string.format("Expected 1 cell, found %d", actual_cells))

        record_test("Initial nutrient spawn", actual_nutrients == 3,
            string.format("Expected 3 nutrients, found %d", actual_nutrients))

        record_test("Initial antibody spawn", actual_antibodies == 2,
            string.format("Expected 2 antibodies, found %d", actual_antibodies))

        record_test("Game not over initially", memory.readbyte(game_over_flag) == 0,
            string.format("game_over_flag should be 0, found %d", memory.readbyte(game_over_flag)))
    end

    -- TEST 2: Antibody movement validation (frame 180)
    if test_frame == 180 then
        -- Check if any antibody has moved from spawn position
        local antibody_moved = false
        for i = 0, 7 do
            local offset = i * 16
            if memory.readbyte(ANTIBODY_DATA + offset) ~= 0 then
                local vx = memory.readbytesigned(ANTIBODY_DATA + offset + 3)
                local vy = memory.readbytesigned(ANTIBODY_DATA + offset + 4)
                if vx ~= 0 or vy ~= 0 then
                    antibody_moved = true
                    break
                end
            end
        end

        record_test("Antibody AI active", antibody_moved,
            "No antibody movement detected - AI may be frozen")
    end

    -- TEST 3: Continuous monitoring
    if test_frame > 60 and test_frame % 60 == 0 then
        -- Check for entity count consistency
        local actual_cells = count_active(CELL_DATA, 16)
        local actual_nutrients = count_active(NUTRIENT_DATA, 8)
        local counter_cells = memory.readbyte(cell_count)
        local counter_nutrients = memory.readbyte(nutrient_count)

        if actual_cells ~= counter_cells then
            record_test("Cell count consistency", false,
                string.format("Counter=%d, Actual=%d", counter_cells, actual_cells))
        end

        if actual_nutrients ~= counter_nutrients then
            record_test("Nutrient count consistency", false,
                string.format("Counter=%d, Actual=%d", counter_nutrients, actual_nutrients))
        end
    end

    -- TEST 4: Stop after 600 frames (10 seconds)
    if test_frame >= 600 and not tests_completed then
        tests_completed = true
        print("")
        print("=== TEST SUMMARY ===")
        print(string.format("Total tests run: %d", #test_results))
        print(string.format("Passed: %d", #test_results - critical_failures))
        print(string.format("Failed: %d", critical_failures))
        print("")

        if critical_failures == 0 then
            print("✓ ALL TESTS PASSED")
            print("The ROM appears to be functioning correctly.")
        else
            print("✗ CRITICAL FAILURES DETECTED")
            print("The ROM has bugs that need to be fixed.")
        end
        print("")
        print("Test details:")
        for _, result in ipairs(test_results) do
            local status = result.passed and "PASS" or "FAIL"
            print(string.format("  [%s] %s - %s", status, result.name, result.message))
        end

        -- Exit after printing results
        print("")
        print("Automated testing complete. Exiting...")
        emu.exit()
    end
end

-- Register frame callback
emu.registerafter(run_tests)

print("Automated test script loaded.")
print("Running tests for 600 frames (10 seconds)...")
print("")
