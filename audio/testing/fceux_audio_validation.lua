-- MITOSIS PANIC - FCEUX Audio Validation Script
-- Purpose: Monitor FamiTone2 audio engine state in real-time
-- Usage: Load in FCEUX via File -> Lua -> New Lua Script Window
--
-- This script monitors:
-- - APU register activity (verifies audio engine writing to hardware)
-- - FamiTone2 RAM state (music/SFX playback status)
-- - Frame timing (FamiToneUpdate execution)
-- - Audio triggers (game events firing SFX)
-- - Performance metrics (cycle usage estimates)

-- ============================================================================
-- CONFIGURATION
-- ============================================================================

-- FamiTone2 Memory Locations (adjust if different in your build)
local FT_TEMP_ZP = 0x00E0       -- Zero page: FT_TEMP (3 bytes)
local FT_BASE_ADR = 0x0300      -- BSS: FT_BASE_ADR (186 bytes)

-- APU Register Addresses
local APU_PULSE1_VOL    = 0x4000
local APU_PULSE1_SWEEP  = 0x4001
local APU_PULSE1_LO     = 0x4002
local APU_PULSE1_HI     = 0x4003
local APU_PULSE2_VOL    = 0x4004
local APU_PULSE2_SWEEP  = 0x4005
local APU_PULSE2_LO     = 0x4006
local APU_PULSE2_HI     = 0x4007
local APU_TRIANGLE_LINEAR = 0x4008
local APU_TRIANGLE_LO   = 0x400A
local APU_TRIANGLE_HI   = 0x400B
local APU_NOISE_VOL     = 0x400C
local APU_NOISE_PERIOD  = 0x400E
local APU_NOISE_LENGTH  = 0x400F
local APU_DMC_FREQ      = 0x4010
local APU_DMC_RAW       = 0x4011
local APU_DMC_START     = 0x4012
local APU_DMC_LEN       = 0x4013
local APU_STATUS        = 0x4015
local APU_FRAME_COUNTER = 0x4017

-- Display Configuration
local DISPLAY_X = 10
local DISPLAY_Y = 10
local LINE_HEIGHT = 8

-- ============================================================================
-- STATE TRACKING
-- ============================================================================

local frame_count = 0
local audio_active = false
local last_pulse1_vol = 0
local last_pulse2_vol = 0
local last_triangle_linear = 0
local last_noise_vol = 0
local apu_write_count = 0
local last_apu_write_frame = 0

-- Channel activity tracking
local pulse1_active = false
local pulse2_active = false
local triangle_active = false
local noise_active = false

-- Performance tracking
local update_detected_frames = {}
local missed_frames = 0

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Read APU register
local function read_apu(addr)
    return memory.readbyte(addr)
end

-- Read FamiTone2 RAM
local function read_ft_ram(offset)
    return memory.readbyte(FT_BASE_ADR + offset)
end

-- Read FamiTone2 Zero Page
local function read_ft_zp(offset)
    return memory.readbyte(FT_TEMP_ZP + offset)
end

-- Check if APU channel is active (volume > 0)
local function check_channel_activity()
    local p1_vol = read_apu(APU_PULSE1_VOL) & 0x0F
    local p2_vol = read_apu(APU_PULSE2_VOL) & 0x0F
    local tri_lin = read_apu(APU_TRIANGLE_LINEAR) & 0x7F
    local noise_vol = read_apu(APU_NOISE_VOL) & 0x0F

    pulse1_active = (p1_vol > 0)
    pulse2_active = (p2_vol > 0)
    triangle_active = (tri_lin > 0)
    noise_active = (noise_vol > 0)

    audio_active = pulse1_active or pulse2_active or triangle_active or noise_active

    return p1_vol, p2_vol, tri_lin, noise_vol
end

-- Detect if APU registers changed this frame (indicates FamiToneUpdate ran)
local function detect_apu_writes()
    local p1_vol, p2_vol, tri_lin, noise_vol = check_channel_activity()

    local changed = false
    if p1_vol ~= last_pulse1_vol then changed = true end
    if p2_vol ~= last_pulse2_vol then changed = true end
    if tri_lin ~= last_triangle_linear then changed = true end
    if noise_vol ~= last_noise_vol then changed = true end

    if changed then
        apu_write_count = apu_write_count + 1
        last_apu_write_frame = frame_count
    end

    last_pulse1_vol = p1_vol
    last_pulse2_vol = p2_vol
    last_triangle_linear = tri_lin
    last_noise_vol = noise_vol

    return changed
end

-- Format volume/linear value as bar graph
local function volume_bar(value, max_value)
    local bar_length = 10
    local filled = math.floor((value / max_value) * bar_length)
    local bar = "["
    for i = 1, bar_length do
        if i <= filled then
            bar = bar .. "#"
        else
            bar = bar .. "-"
        end
    end
    bar = bar .. "]"
    return bar
end

-- ============================================================================
-- MAIN DISPLAY
-- ============================================================================

local function draw_audio_state()
    local y = DISPLAY_Y

    -- Title
    gui.text(DISPLAY_X, y, "=== FAMITONE2 AUDIO MONITOR ===")
    y = y + LINE_HEIGHT + 4

    -- Frame info
    gui.text(DISPLAY_X, y, string.format("Frame: %d", frame_count))
    y = y + LINE_HEIGHT

    -- Audio status
    local status_color = audio_active and "green" or "red"
    local status_text = audio_active and "ACTIVE" or "SILENT"
    gui.text(DISPLAY_X, y, string.format("Audio Status: %s", status_text), status_color)
    y = y + LINE_HEIGHT

    -- APU write activity
    local frames_since_write = frame_count - last_apu_write_frame
    local write_status = frames_since_write < 60 and "OK" or "STALE"
    local write_color = frames_since_write < 60 and "white" or "yellow"
    gui.text(DISPLAY_X, y, string.format("APU Writes: %d (last: %d frames ago) [%s]",
        apu_write_count, frames_since_write, write_status), write_color)
    y = y + LINE_HEIGHT + 4

    -- Channel activity
    gui.text(DISPLAY_X, y, "--- CHANNEL ACTIVITY ---")
    y = y + LINE_HEIGHT

    local p1_vol, p2_vol, tri_lin, noise_vol = check_channel_activity()

    -- Pulse 1
    local p1_color = pulse1_active and "cyan" or "gray"
    gui.text(DISPLAY_X, y, string.format("Pulse 1:   %s Vol:%02d",
        volume_bar(p1_vol, 15), p1_vol), p1_color)
    y = y + LINE_HEIGHT

    -- Pulse 2
    local p2_color = pulse2_active and "cyan" or "gray"
    gui.text(DISPLAY_X, y, string.format("Pulse 2:   %s Vol:%02d",
        volume_bar(p2_vol, 15), p2_vol), p2_color)
    y = y + LINE_HEIGHT

    -- Triangle
    local tri_color = triangle_active and "magenta" or "gray"
    gui.text(DISPLAY_X, y, string.format("Triangle:  %s Lin:%02d",
        volume_bar(tri_lin, 127), tri_lin), tri_color)
    y = y + LINE_HEIGHT

    -- Noise
    local noise_color = noise_active and "orange" or "gray"
    gui.text(DISPLAY_X, y, string.format("Noise:     %s Vol:%02d",
        volume_bar(noise_vol, 15), noise_vol), noise_color)
    y = y + LINE_HEIGHT + 4

    -- APU Status Register
    local apu_status = read_apu(APU_STATUS)
    gui.text(DISPLAY_X, y, string.format("APU Status: $%02X", apu_status))
    y = y + LINE_HEIGHT

    local channels_enabled = ""
    if (apu_status & 0x01) ~= 0 then channels_enabled = channels_enabled .. "P1 " end
    if (apu_status & 0x02) ~= 0 then channels_enabled = channels_enabled .. "P2 " end
    if (apu_status & 0x04) ~= 0 then channels_enabled = channels_enabled .. "TRI " end
    if (apu_status & 0x08) ~= 0 then channels_enabled = channels_enabled .. "NOI " end
    if (apu_status & 0x10) ~= 0 then channels_enabled = channels_enabled .. "DMC " end
    gui.text(DISPLAY_X + 10, y, string.format("Enabled: %s", channels_enabled))
    y = y + LINE_HEIGHT + 4

    -- FamiTone2 RAM State (first 16 bytes for overview)
    gui.text(DISPLAY_X, y, "--- FAMITONE2 RAM (first 16 bytes) ---")
    y = y + LINE_HEIGHT

    local ram_line = ""
    for i = 0, 15 do
        ram_line = ram_line .. string.format("%02X ", read_ft_ram(i))
        if i == 7 then
            gui.text(DISPLAY_X, y, ram_line)
            y = y + LINE_HEIGHT
            ram_line = ""
        end
    end
    gui.text(DISPLAY_X, y, ram_line)
    y = y + LINE_HEIGHT + 4

    -- FamiTone2 Zero Page
    gui.text(DISPLAY_X, y, "--- FAMITONE2 ZP (FT_TEMP) ---")
    y = y + LINE_HEIGHT
    local zp_line = string.format("%02X %02X %02X",
        read_ft_zp(0), read_ft_zp(1), read_ft_zp(2))
    gui.text(DISPLAY_X, y, zp_line)
    y = y + LINE_HEIGHT + 4

    -- Warnings
    if not audio_active and frame_count > 120 then
        gui.text(DISPLAY_X, y, "WARNING: No audio activity detected!", "red")
        y = y + LINE_HEIGHT
    end

    if frames_since_write > 120 then
        gui.text(DISPLAY_X, y, "WARNING: APU not being updated!", "red")
        y = y + LINE_HEIGHT
    end
end

-- ============================================================================
-- LOGGING
-- ============================================================================

local function log_audio_event(event_type, details)
    print(string.format("[Frame %d] AUDIO: %s - %s", frame_count, event_type, details))
end

-- Detect audio events (volume changes indicate new notes/SFX)
local function detect_audio_events()
    local p1_vol, p2_vol, tri_lin, noise_vol = check_channel_activity()

    -- Pulse 1 new note
    if p1_vol > 0 and last_pulse1_vol == 0 then
        log_audio_event("PULSE1_START", string.format("Vol=%d", p1_vol))
    end

    -- Pulse 2 new note
    if p2_vol > 0 and last_pulse2_vol == 0 then
        log_audio_event("PULSE2_START", string.format("Vol=%d", p2_vol))
    end

    -- Triangle new note
    if tri_lin > 0 and last_triangle_linear == 0 then
        log_audio_event("TRIANGLE_START", string.format("Linear=%d", tri_lin))
    end

    -- Noise new note
    if noise_vol > 0 and last_noise_vol == 0 then
        log_audio_event("NOISE_START", string.format("Vol=%d", noise_vol))
    end
end

-- ============================================================================
-- FRAME CALLBACK
-- ============================================================================

local function on_frame()
    frame_count = frame_count + 1

    -- Detect APU register changes
    local apu_updated = detect_apu_writes()

    -- Detect new audio events
    detect_audio_events()

    -- Draw monitor display
    draw_audio_state()

    -- Log startup
    if frame_count == 60 then
        print("=== FAMITONE2 AUDIO MONITOR STARTED ===")
        print("Monitoring APU registers and FamiTone2 RAM state...")
        print("Configure FT_TEMP_ZP and FT_BASE_ADR addresses if needed.")
    end

    -- Periodic status report
    if frame_count % 600 == 0 then  -- Every 10 seconds
        local active_channels = 0
        if pulse1_active then active_channels = active_channels + 1 end
        if pulse2_active then active_channels = active_channels + 1 end
        if triangle_active then active_channels = active_channels + 1 end
        if noise_active then active_channels = active_channels + 1 end

        print(string.format("[%d sec] Audio: %s, Channels active: %d, APU writes: %d",
            frame_count / 60,
            audio_active and "ACTIVE" or "SILENT",
            active_channels,
            apu_write_count))
    end
end

-- ============================================================================
-- INITIALIZATION
-- ============================================================================

print("==================================================")
print("MITOSIS PANIC - FamiTone2 Audio Validation Script")
print("==================================================")
print("")
print("CONFIGURATION:")
print(string.format("  FT_TEMP (ZP):     $%04X", FT_TEMP_ZP))
print(string.format("  FT_BASE_ADR:      $%04X", FT_BASE_ADR))
print("")
print("MONITORING:")
print("  - APU registers ($4000-$4017)")
print("  - FamiTone2 RAM state")
print("  - Audio channel activity")
print("  - Frame-by-frame updates")
print("")
print("Events will be logged to console.")
print("Visual display shown in emulator window.")
print("")
print("Starting monitor...")

-- Register frame callback
emu.registerafter(on_frame)

-- ============================================================================
-- NOTES
-- ============================================================================

--[[

TROUBLESHOOTING:

1. "No audio activity detected" warning:
   - Check if FamiToneInit was called during game startup
   - Verify FamiToneUpdate is being called every frame in NMI
   - Check if music_data and sfx_data are properly included

2. "APU not being updated" warning:
   - FamiToneUpdate may not be executing
   - Check NMI handler includes jsr FamiToneUpdate
   - Verify NMI is firing every frame

3. Wrong memory addresses:
   - Update FT_TEMP_ZP and FT_BASE_ADR constants at top of script
   - Check your game's .map file for actual addresses
   - Addresses must match what's defined in your assembly code

4. No channels enabled in APU Status:
   - APU may not be initialized
   - Check if $4015 is being written during startup
   - Verify APU frame counter ($4017) is configured

EXPECTED BEHAVIOR:

- Frame count increases at 60 FPS
- APU writes should occur every frame or nearly every frame
- At least one channel should be active when music/SFX play
- Volume bars should animate during audio playback
- Events logged when new notes start

]]
