; MITOSIS PANIC - Main Entry Point
; Phase 2: Controller Input & Entity System
; Assembles with ca65 (cc65 toolchain)

.include "constants.inc"

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
    cell_count = $0501     ; Number of active cells
    nutrient_count = $0502 ; Number of active nutrients
    score_lo = $0503
    score_hi = $0504

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

    ; Game logic during VBlank
    jsr read_controller
    jsr update_cells
    jsr update_nutrients
    jsr check_collisions
    jsr render_entities

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

    ; Spawn initial nutrients
    lda #0
    sta nutrient_count
    jsr spawn_nutrient
    jsr spawn_nutrient
    jsr spawn_nutrient

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

    rts

; ============================================================
; update_nutrients - Update nutrient animations
; ============================================================
update_nutrients:
    ; For now, nutrients are static
    ; TODO: Add animation frames later
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
; check_collisions - Check cell vs nutrient collisions
; ============================================================
check_collisions:
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
    ; Deactivate nutrient
    lda #0
    sta $0480,y

    ; Decrement nutrient count
    dec nutrient_count

    ; Increment score (TODO: BCD math)
    inc score_lo

    ; Trigger mitosis if cell count < max
    lda cell_count
    cmp #MAX_CELLS
    bcs :+
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
