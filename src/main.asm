; MITOSIS PANIC - Main Entry Point
; Phase 5: Audio Integration with FamiTone2
; Assembles with ca65 (cc65 toolchain)

.include "constants.inc"

; FamiTone2 configuration (must be defined BEFORE including famitone2.s)
FT_PAL_SUPPORT    = 0      ; 0 = no PAL support
FT_NTSC_SUPPORT   = 1      ; 1 = NTSC support
FT_SFX_ENABLE     = 1      ; Enable sound effects
FT_SFX_STREAMS    = 4      ; Number of simultaneous SFX
FT_THREAD         = 1      ; Thread-safe mode
FT_DPCM_ENABLE    = 0      ; 0 = no DPCM samples (saves ROM)
FT_DPCM_OFF       = $c000  ; DPCM data location
FT_PITCH_FIX      = 0      ; No pitch fix (NTSC only)

; FamiTone2 SFX IDs (from audio_constants.s)
SFX_MITOSIS       = 0
SFX_NUTRIENT_A    = 1
SFX_ANTIBODY_WARN = 4
SFX_GAME_OVER     = 7

; Music track IDs
MUSIC_MAIN_THEME  = 0

.segment "HEADER"
    .byte "NES", $1A    ; iNES header identifier
    .byte 2             ; 2x 16KB PRG-ROM
    .byte 1             ; 1x 8KB CHR-ROM
    .byte $01           ; Mapper 0, vertical mirroring
    .byte $00           ; Mapper 0
    .byte $00, $00, $00, $00, $00, $00, $00, $00

.segment "VECTORS"
    .addr nmi_handler, reset_handler, irq_handler

.segment "ZEROPAGE"
    frame_count:  .res 1
    controller1:  .res 1      ; Current controller state
    controller1_prev: .res 1  ; Previous frame controller state
    temp:         .res 1      ; Temporary variable
    temp2:        .res 1      ; Temporary variable 2
    rng_seed:     .res 2      ; Random number generator seed
    FT_TEMP:      .res 3      ; FamiTone2 temporary variables

.segment "BSS"
    ; OAM shadow buffer (sprites) at $0200
    ; Cell entity data at $0300 (per TECHNICAL_SPEC.md)
    ; Each cell is 16 bytes:
    ;   +$00: Active flag (0=inactive, 1=active)
    ;   +$01: X position
    ;   +$02: Y position
    ;   +$03: X velocity (signed)
    ;   +$04: Y velocity (signed)
    ;   +$05: Size (radius)
    ;   +$06: Animation frame
    ;   +$07: State flags
    ;   +$08-$0F: Reserved
    cell_data = $0300

    ; Game state variables at $0500
    game_state = $0500
    cell_count = $0501         ; Number of active cells
    nutrient_count = $0502     ; Number of active nutrients
    antibody_count = $0503     ; Number of active antibodies
    nutrients_collected = $0504 ; Total nutrients collected (for mitosis trigger)
    score_lo = $0505
    score_hi = $0506
    game_over_flag = $0507     ; 0=playing, 1=game over

    ; FamiTone2 RAM (186 bytes at $0600-$06BA)
    FT_BASE_ADR = $0600
    .res 186                   ; FamiTone2 workspace

.segment "CODE"

reset_handler:
    sei             ; Disable interrupts
    cld             ; Clear decimal mode
    ldx #$FF
    txs             ; Set up stack

    ; Disable rendering during setup
    lda #$00
    sta $2000       ; Disable NMI
    sta $2001       ; Disable rendering

    ; Wait for PPU warm-up (2 frames)
    bit $2002
:   bit $2002
    bpl :-
:   bit $2002
    bpl :-

    ; Clear RAM
    lda #$00
    ldx #$00
:   sta $0000,x
    sta $0100,x
    sta $0200,x
    sta $0300,x
    sta $0400,x
    sta $0500,x
    sta $0600,x
    sta $0700,x
    inx
    bne :-

    ; Load palettes
    jsr load_palettes

    ; Initialize game state
    jsr init_game_state

    ; Set up sprites
    jsr init_sprites

    ; Initialize audio system
    jsr init_audio

    ; Enable rendering
    lda #%10000000  ; Enable NMI
    sta $2000
    lda #%00011110  ; Enable sprites and background
    sta $2001

main_loop:
    ; Wait for NMI to handle game logic
    jmp main_loop

; ============================================================
; NMI Handler - Called every frame (60 FPS)
; ============================================================
nmi_handler:
    ; Save registers
    pha
    txa
    pha
    tya
    pha

    ; OAM DMA - Transfer sprite data to PPU
    lda #$00
    sta $2003       ; Set OAM address to 0
    lda #$02        ; Transfer from $0200 (oam_buffer)
    sta $4014       ; Start DMA

    ; Increment frame counter
    inc frame_count

    ; Update audio engine (must be done every frame)
    jsr FamiToneUpdate

    ; Game logic during VBlank

    ; Check if game is over
    lda game_over_flag
    bne game_over_state

    ; Normal gameplay
    jsr read_controller
    jsr update_cells
    jsr update_antibodies
    jsr update_nutrients
    jsr check_collisions
    jsr render_entities
    jmp nmi_done

game_over_state:
    ; Game over - just render, wait for restart
    jsr render_entities
    ; TODO: Check for Start button to restart

nmi_done:

    ; Restore registers
    pla
    tay
    pla
    tax
    pla
    rti

; ============================================================
; IRQ Handler (unused)
; ============================================================
irq_handler:
    rti

; ============================================================
; load_palettes - Load color palettes into PPU
; ============================================================
load_palettes:
    ; Set PPU address to palette memory
    lda #$3F
    sta $2006
    lda #$00
    sta $2006

    ; Load background palettes
    ldx #0
:   lda bg_palette,x
    sta $2007
    inx
    cpx #16
    bne :-

    ; Load sprite palettes
    ldx #0
:   lda sprite_palette,x
    sta $2007
    inx
    cpx #16
    bne :-

    rts

; ============================================================
; init_sprites - Initialize sprite buffer
; ============================================================
init_sprites:
    ; Clear all sprites (move off-screen)
    ldx #0
    lda #$FF        ; Y = $FF means off-screen
:   sta $0200,x
    inx
    inx
    inx
    inx
    cpx #0          ; Loop 64 times (256 bytes / 4 bytes per sprite)
    bne :-
    rts

; ============================================================
; init_game_state - Initialize game entities
; ============================================================
init_game_state:
    ; Initialize first cell (player starts with 1 cell)
    lda #1
    sta cell_count

    ; Cell 0: Active at center of screen
    lda #1          ; Active flag
    sta cell_data+0
    lda #120        ; X position (center)
    sta cell_data+1
    lda #112        ; Y position (center)
    sta cell_data+2
    lda #0          ; X velocity
    sta cell_data+3
    lda #0          ; Y velocity
    sta cell_data+4
    lda #8          ; Size (radius = 8 pixels)
    sta cell_data+5
    lda #0          ; Animation frame
    sta cell_data+6
    lda #0          ; State flags
    sta cell_data+7

    ; Clear remaining cells (make inactive)
    ldx #16         ; Start at cell 1
:   lda #0
    sta cell_data,x
    inx
    cpx #240        ; 15 more cells * 16 bytes = 240
    bne :-

    ; Initialize RNG seed with a "random" value
    lda #$A5
    sta rng_seed
    lda #$5A
    sta rng_seed+1

    ; Initialize game state counters
    lda #0
    sta nutrient_count
    sta nutrients_collected  ; FIX: Initialize mitosis counter
    sta antibody_count
    sta game_over_flag
    sta score_lo
    sta score_hi

    ; Spawn initial nutrients
    jsr spawn_nutrient
    jsr spawn_nutrient
    jsr spawn_nutrient

    ; Spawn initial antibodies (start with 2)
    jsr spawn_antibody
    jsr spawn_antibody

    rts

; ============================================================
; read_controller - Read NES controller 1
; ============================================================
read_controller:
    ; Save previous state
    lda controller1
    sta controller1_prev

    ; Strobe controller
    lda #1
    sta $4016
    lda #0
    sta $4016

    ; Read 8 buttons (A, B, Select, Start, Up, Down, Left, Right)
    ldx #8
:   lda $4016
    lsr a           ; Bit 0 -> Carry
    rol controller1 ; Carry -> controller1
    dex
    bne :-

    rts

; ============================================================
; update_cells - Update all active cell positions
; ============================================================
update_cells:
    ; For each active cell, apply controller input
    ldx #0          ; Cell index (0-15)

update_cell_loop:
    ; Check if cell is active
    lda cell_data,x
    bne :+
    jmp next_cell   ; Skip if inactive
:

    ; Apply controller input to velocity
    ; D-Pad mapping: bit 7=A, 6=B, 5=Select, 4=Start, 3=Up, 2=Down, 1=Left, 0=Right

    ; Check Right
    lda controller1
    and #$01
    beq :+
    inc cell_data+3,x   ; Increase X velocity
:
    ; Check Left
    lda controller1
    and #$02
    beq :+
    dec cell_data+3,x   ; Decrease X velocity
:
    ; Check Down
    lda controller1
    and #$04
    beq :+
    inc cell_data+4,x   ; Increase Y velocity
:
    ; Check Up
    lda controller1
    and #$08
    beq :+
    dec cell_data+4,x   ; Decrease Y velocity
:

    ; Apply velocity to position
    lda cell_data+1,x   ; X position
    clc
    adc cell_data+3,x   ; Add X velocity
    sta cell_data+1,x

    lda cell_data+2,x   ; Y position
    clc
    adc cell_data+4,x   ; Add Y velocity
    sta cell_data+2,x

    ; Clamp to arena boundaries
    lda cell_data+1,x   ; Check X position
    cmp #ARENA_LEFT
    bcs :+
    lda #ARENA_LEFT     ; Clamp to left edge
    sta cell_data+1,x
:   lda cell_data+1,x
    cmp #ARENA_RIGHT
    bcc :+
    lda #ARENA_RIGHT-1  ; Clamp to right edge
    sta cell_data+1,x
:
    lda cell_data+2,x   ; Check Y position
    cmp #ARENA_TOP
    bcs :+
    lda #ARENA_TOP      ; Clamp to top edge
    sta cell_data+2,x
:   lda cell_data+2,x
    cmp #ARENA_BOTTOM
    bcc :+
    lda #ARENA_BOTTOM-1 ; Clamp to bottom edge
    sta cell_data+2,x
:

    ; Apply friction (slow down velocity)
    lda cell_data+3,x
    beq :+              ; Skip if velocity is 0
    bmi neg_x_vel       ; Handle negative velocity
    dec cell_data+3,x   ; Decrease positive velocity
    jmp :+
neg_x_vel:
    inc cell_data+3,x   ; Increase negative velocity (toward 0)
:

    lda cell_data+4,x
    beq :+              ; Skip if velocity is 0
    bmi neg_y_vel       ; Handle negative velocity
    dec cell_data+4,x   ; Decrease positive velocity
    jmp :+
neg_y_vel:
    inc cell_data+4,x   ; Increase negative velocity (toward 0)
:

next_cell:
    ; Move to next cell (16 bytes per cell)
    txa
    clc
    adc #16
    tax
    cpx #240        ; Check all 15 cells (16 * 15 = 240)
    beq :+
    jmp update_cell_loop
:
    rts

; ============================================================
; render_entities - Render all active cells and nutrients
; ============================================================
render_entities:
    ; Clear OAM buffer first
    ldx #0
    lda #$FF
:   sta $0200,x
    inx
    bne :-

    ; Render each active cell as a sprite
    ldx #0          ; Cell index
    ldy #0          ; OAM buffer index

render_cell_loop:
    ; Check if cell is active
    lda cell_data,x
    beq skip_render_cell

    ; Render cell as a single sprite (will be 2x2 metatile later)
    lda cell_data+2,x   ; Y position
    sta $0200,y
    iny

    lda #$01            ; Tile index (cell sprite)
    sta $0200,y
    iny

    lda #$00            ; Attributes (palette 0 = cyan)
    sta $0200,y
    iny

    lda cell_data+1,x   ; X position
    sta $0200,y
    iny

skip_render_cell:
    ; Move to next cell
    txa
    clc
    adc #16
    tax
    cpx #240
    bne render_cell_loop

    ; Now render nutrients
    ldx #0          ; Nutrient index

render_nutrient_loop:
    ; Check if nutrient is active
    lda $0480,x     ; NUTRIENT_DATA base
    beq skip_render_nutrient

    ; Render nutrient as a sprite
    lda $0482,x     ; Y position
    sta $0200,y
    iny

    lda #$10        ; Tile index (nutrient sprite)
    sta $0200,y
    iny

    lda #$02        ; Attributes (palette 2 = green)
    sta $0200,y
    iny

    lda $0481,x     ; X position
    sta $0200,y
    iny

skip_render_nutrient:
    ; Move to next nutrient
    txa
    clc
    adc #16
    tax
    cpx #128        ; 8 nutrients * 16 bytes
    bne render_nutrient_loop

    ; Now render antibodies
    ldx #0          ; Antibody index

render_antibody_loop:
    ; Check if antibody is active
    lda $0400,x     ; ANTIBODY_DATA base
    beq skip_render_antibody

    ; Render antibody as a sprite
    lda $0402,x     ; Y position
    sta $0200,y
    iny

    lda #$02        ; Tile index (Y-shaped antibody from CHR)
    sta $0200,y
    iny

    lda #$01        ; Attributes (palette 1 = red)
    sta $0200,y
    iny

    lda $0401,x     ; X position
    sta $0200,y
    iny

skip_render_antibody:
    ; Move to next antibody
    txa
    clc
    adc #16
    tax
    cpx #128        ; 8 antibodies * 16 bytes
    bne render_antibody_loop

    rts

; ============================================================
; update_nutrients - Update nutrient animations
; ============================================================
update_nutrients:
    ; For now, nutrients are static
    ; TODO: Add animation frames later
    rts

; ============================================================
; update_antibodies - Update antibody AI and movement
; ============================================================
update_antibodies:
    ldx #0

update_antibody_loop:
    ; Check if antibody is active
    lda $0400,x     ; ANTIBODY_DATA active flag
    bne :+
    jmp next_antibody
:

    ; Get AI type
    lda $0405,x     ; AI type offset
    cmp #0
    beq ai_chase
    cmp #1
    beq ai_patrol_h
    cmp #2
    beq ai_patrol_v
    jmp next_antibody

ai_chase:
    ; Chase AI: move toward nearest cell
    ; Simple implementation: move toward cell 0
    lda cell_data+1 ; Cell 0 X
    cmp $0401,x     ; Antibody X
    bcc chase_left
    beq chase_check_y
    ; Cell is to the right
    inc $0401,x
    jmp chase_check_y
chase_left:
    dec $0401,x

chase_check_y:
    lda cell_data+2 ; Cell 0 Y
    cmp $0402,x     ; Antibody Y
    bcc chase_up
    beq next_antibody
    ; Cell is below
    inc $0402,x
    jmp next_antibody
chase_up:
    dec $0402,x
    jmp next_antibody

ai_patrol_h:
    ; Horizontal patrol
    lda $0403,x     ; X velocity
    beq :+          ; If velocity is 0, set it
    clc
    adc $0401,x     ; Apply velocity to X
    sta $0401,x

    ; Check bounds and reverse
    cmp #ARENA_LEFT+16
    bcc patrol_h_reverse
    cmp #ARENA_RIGHT-16
    bcs patrol_h_reverse
    jmp next_antibody

:   lda #2          ; Initial velocity
    sta $0403,x
    jmp next_antibody

patrol_h_reverse:
    lda $0403,x
    eor #$FF        ; Negate velocity (two's complement)
    clc
    adc #1
    sta $0403,x
    jmp next_antibody

ai_patrol_v:
    ; Vertical patrol
    lda $0404,x     ; Y velocity
    beq :+          ; If velocity is 0, set it
    clc
    adc $0402,x     ; Apply velocity to Y
    sta $0402,x

    ; Check bounds and reverse
    cmp #ARENA_TOP+16
    bcc patrol_v_reverse
    cmp #ARENA_BOTTOM-16
    bcs patrol_v_reverse
    jmp next_antibody

:   lda #2          ; Initial velocity
    sta $0404,x
    jmp next_antibody

patrol_v_reverse:
    lda $0404,x
    eor #$FF        ; Negate velocity
    clc
    adc #1
    sta $0404,x

next_antibody:
    txa
    clc
    adc #16
    tax
    cpx #128        ; 8 antibodies * 16 bytes
    beq :+
    jmp update_antibody_loop
:
    rts

; ============================================================
; spawn_antibody - Spawn a new antibody
; ============================================================
spawn_antibody:
    ; Find first inactive antibody slot
    ldx #0
find_antibody_slot:
    lda $0400,x     ; Check active flag
    beq found_antibody_slot
    txa
    clc
    adc #16
    tax
    cpx #128
    bne find_antibody_slot
    rts             ; No free slots

found_antibody_slot:
    ; Activate antibody
    lda #1
    sta $0400,x     ; Active flag

    ; Spawn at edge of arena
    jsr random
    and #$01
    bne spawn_ab_vertical

spawn_ab_horizontal:
    ; Spawn on left or right edge
    jsr random
    and #$01
    bne :+
    lda #ARENA_LEFT+8
    sta $0401,x
    jmp :++
:   lda #ARENA_RIGHT-8
    sta $0401,x
:
    ; Random Y position
    jsr random
    and #$7F
    clc
    adc #48
    sta $0402,x
    ; Set horizontal patrol AI
    lda #1
    sta $0405,x
    lda #2
    sta $0403,x     ; Initial velocity
    jmp spawn_ab_done

spawn_ab_vertical:
    ; Spawn on top or bottom edge
    jsr random
    and #$01
    bne :+
    lda #ARENA_TOP+8
    sta $0402,x
    jmp :++
:   lda #ARENA_BOTTOM-8
    sta $0402,x
:
    ; Random X position
    jsr random
    and #$7F
    clc
    adc #56
    sta $0401,x
    ; Set vertical patrol AI
    lda #2
    sta $0405,x
    lda #2
    sta $0404,x     ; Initial velocity

spawn_ab_done:
    ; Play antibody spawn warning sound
    lda #SFX_ANTIBODY_WARN
    ldx #FT_SFX_CH1         ; Pulse 2 channel
    jsr FamiToneSfxPlay

    ; Increment antibody count
    inc antibody_count
    rts

; ============================================================
; spawn_nutrient - Spawn a new nutrient at random position
; ============================================================
spawn_nutrient:
    ; Find first inactive nutrient slot
    ldx #0
find_nutrient_slot:
    lda $0480,x     ; Check active flag
    beq found_nutrient_slot
    txa
    clc
    adc #16
    tax
    cpx #128
    bne find_nutrient_slot
    rts             ; No free slots

found_nutrient_slot:
    ; Activate nutrient
    lda #1
    sta $0480,x     ; Active flag

    ; Generate random X position (16-240)
    jsr random
    and #$7F        ; 0-127
    clc
    adc #56         ; 56-183
    sta $0481,x     ; X position

    ; Generate random Y position (32-224)
    jsr random
    and #$7F        ; 0-127
    clc
    adc #48         ; 48-175
    sta $0482,x     ; Y position

    ; Set animation frame
    lda #0
    sta $0483,x

    ; Increment nutrient count
    inc nutrient_count

    rts

; ============================================================
; random - Generate pseudo-random number (LCG)
; Returns: A = random byte
; ============================================================
random:
    ; Linear congruential generator
    ; seed = (seed * 75 + 74) % 65537
    lda rng_seed
    asl a
    asl a           ; * 4
    clc
    adc rng_seed    ; * 5
    asl a
    asl a
    asl a           ; * 40
    clc
    adc rng_seed    ; * 41
    clc
    adc rng_seed+1  ; Mix in high byte
    adc #74         ; Add constant
    sta rng_seed
    eor rng_seed+1
    sta rng_seed+1
    rts

; ============================================================
; check_collisions - Check all collision types
; ============================================================
check_collisions:
    ; First check cell vs antibody (game over condition)
    jsr check_cell_antibody_collision

    ; Then check cell vs nutrient (collection)
    jsr check_cell_nutrient_collision
    rts

; ============================================================
; check_cell_antibody_collision - Check for game over
; ============================================================
check_cell_antibody_collision:
    ldx #0

check_cell_ab_loop:
    lda cell_data,x
    beq next_cell_ab

    ; Check against each antibody
    ldy #0

check_ab_loop:
    lda $0400,y     ; Check if antibody is active
    beq next_ab

    ; AABB collision check
    lda cell_data+1,x   ; Cell X
    sec
    sbc $0401,y         ; Antibody X
    bpl :+
    eor #$FF
    clc
    adc #1
:   cmp #14             ; Collision threshold (slightly larger)
    bcs next_ab

    lda cell_data+2,x   ; Cell Y
    sec
    sbc $0402,y         ; Antibody Y
    bpl :+
    eor #$FF
    clc
    adc #1
:   cmp #14
    bcs next_ab

    ; COLLISION! Game over
    lda #1
    sta game_over_flag

    ; Play game over sound
    lda #SFX_GAME_OVER
    ldx #FT_SFX_CH0         ; Pulse 1 channel
    jsr FamiToneSfxPlay

    rts

next_ab:
    tya
    clc
    adc #16
    tay
    cpy #128
    bne check_ab_loop

next_cell_ab:
    txa
    clc
    adc #16
    tax
    cpx #240
    bne check_cell_ab_loop
    rts

; ============================================================
; check_cell_nutrient_collision - Check for collection
; ============================================================
check_cell_nutrient_collision:
    ; For each active cell
    ldx #0

check_cell_loop:
    lda cell_data,x
    beq next_cell_collision

    ; Check against each nutrient
    ldy #0

check_nutrient_loop:
    lda $0480,y     ; Check if nutrient is active
    beq next_nutrient

    ; Simple AABB collision (8x8 boxes)
    ; Check X overlap
    lda cell_data+1,x   ; Cell X
    sec
    sbc $0481,y         ; Nutrient X
    bpl :+
    eor #$FF
    clc
    adc #1
:   cmp #12             ; Collision threshold
    bcs next_nutrient   ; No collision

    ; Check Y overlap
    lda cell_data+2,x   ; Cell Y
    sec
    sbc $0482,y         ; Nutrient Y
    bpl :+
    eor #$FF
    clc
    adc #1
:   cmp #12             ; Collision threshold
    bcs next_nutrient   ; No collision

    ; COLLISION! Collect nutrient
    jsr collect_nutrient

next_nutrient:
    tya
    clc
    adc #16
    tay
    cpy #128
    bne check_nutrient_loop

next_cell_collision:
    txa
    clc
    adc #16
    tax
    cpx #240
    bne check_cell_loop

    rts

; ============================================================
; collect_nutrient - Handle nutrient collection
; Input: X = cell index, Y = nutrient index
; ============================================================
collect_nutrient:
    ; Play nutrient collection sound
    lda #SFX_NUTRIENT_A
    ldx #FT_SFX_CH0         ; Pulse 1 channel
    jsr FamiToneSfxPlay

    ; Deactivate nutrient
    lda #0
    sta $0480,y

    ; Decrement nutrient count
    dec nutrient_count

    ; Increment score (TODO: BCD math)
    inc score_lo

    ; Increment nutrient collection counter
    inc nutrients_collected

    ; Check if we've collected 10 nutrients (mitosis trigger)
    lda nutrients_collected
    cmp #10
    bcc :+              ; Less than 10, skip mitosis

    ; Reset counter
    lda #0
    sta nutrients_collected

    ; Trigger mitosis if cell count < max
    lda cell_count
    cmp #MAX_CELLS
    bcs :+

    ; Play mitosis sound
    lda #SFX_MITOSIS
    ldx #FT_SFX_CH0         ; Pulse 1 channel
    jsr FamiToneSfxPlay

    jsr trigger_mitosis
:

    ; Spawn a new nutrient to replace collected one
    jsr spawn_nutrient

    rts

; ============================================================
; trigger_mitosis - Divide cell (create a copy)
; Input: X = cell index to divide
; ============================================================
trigger_mitosis:
    ; Find first inactive cell slot
    stx temp        ; Save current cell index
    ldx #0

find_cell_slot:
    lda cell_data,x
    beq found_cell_slot
    txa
    clc
    adc #16
    tax
    cpx #240
    bne find_cell_slot
    ldx temp
    rts             ; No free slots

found_cell_slot:
    ; Copy parent cell data to new cell
    ldy temp        ; Parent cell index
    lda cell_data+1,y   ; Parent X
    sta cell_data+1,x
    lda cell_data+2,y   ; Parent Y
    sta cell_data+2,x
    lda cell_data+3,y   ; Parent VX
    sta cell_data+3,x
    lda cell_data+4,y   ; Parent VY
    sta cell_data+4,x
    lda cell_data+5,y   ; Parent size
    sta cell_data+5,x

    ; Activate new cell
    lda #1
    sta cell_data,x

    ; Offset position slightly
    lda cell_data+1,x
    clc
    adc #8
    sta cell_data+1,x

    ; Increment cell count
    inc cell_count

    ldx temp        ; Restore cell index
    rts

; ============================================================
; init_audio - Initialize FamiTone2 sound engine
; ============================================================
init_audio:
    ; Initialize FamiTone2
    lda #0                      ; 0 = NTSC
    ldx #<music_data
    ldy #>music_data
    jsr FamiToneInit

    ; Initialize sound effects
    ldx #<sfx_data
    ldy #>sfx_data
    jsr FamiToneSfxInit

    ; Start background music
    lda #MUSIC_MAIN_THEME
    jsr FamiToneMusicPlay

    rts

; ============================================================
; Data Section
; ============================================================
.segment "RODATA"

; Background palette (4 sets of 4 colors)
bg_palette:
    .byte $0F, $00, $10, $30    ; Grayscale
    .byte $0F, $01, $11, $21    ; Blues
    .byte $0F, $06, $16, $26    ; Reds
    .byte $0F, $0A, $1A, $2A    ; Greens

; Sprite palette (4 sets of 4 colors)
sprite_palette:
    .byte $0F, $0C, $1C, $2C    ; Cyan (cells)
    .byte $0F, $06, $16, $26    ; Red (antibodies)
    .byte $0F, $0A, $1A, $2A    ; Green (nutrients)
    .byte $0F, $00, $10, $30    ; Grayscale (UI)

; ============================================================
; CHR-ROM Data
; ============================================================
.segment "CHR"
    ; Include the CHR data file
    .incbin "../graphics/game.chr"

; ============================================================
; Audio Engine and Data
; ============================================================
.segment "CODE"

; Include FamiTone2 sound engine
.include "../audio/engine/famitone2.s"

; Include music and SFX data
.segment "RODATA"
    .include "../audio/exports/music_data.s"
    .include "../audio/exports/sfx_data.s"
