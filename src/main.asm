; MITOSIS PANIC - Main Entry Point
; Hello World ROM - Phase 1
; Assembles with ca65 (cc65 toolchain)

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
    frame_count: .res 1
    sprite_x:    .res 1
    sprite_y:    .res 1

.segment "BSS"
    ; OAM shadow buffer (sprites)
    oam_buffer: .res 256

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

    ; Initialize sprite position (center of screen)
    lda #120
    sta sprite_x
    lda #112
    sta sprite_y

    ; Set up one test sprite
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

    ; Simple animation: move sprite right slowly
    lda frame_count
    and #$03        ; Only every 4 frames
    bne :+
    inc sprite_x    ; Move right
:

    ; Update sprite position in OAM buffer
    lda sprite_y
    sta $0200       ; Y position
    lda #$01        ; Tile index (will be a cell sprite)
    sta $0201
    lda #$00        ; Attributes (palette 0)
    sta $0202
    lda sprite_x
    sta $0203       ; X position

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

    ; Sprite 0 will be set by NMI handler
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
