; MITOSIS PANIC - NES Main Program
; Phase 1: Hello World ROM with basic initialization
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
    nmi_ready: .res 1

.segment "BSS"
    ; OAM shadow buffer at $0200-$02FF (defined by hardware)

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

    ; Wait for PPU warm-up (2 VBlank periods)
    bit $2002
:   bit $2002
    bpl :-
:   bit $2002
    bpl :-

    ; Clear RAM ($0000-$07FF)
    lda #$00
    ldx #$00
clear_ram:
    sta $0000,x
    sta $0100,x
    sta $0200,x
    sta $0300,x
    sta $0400,x
    sta $0500,x
    sta $0600,x
    sta $0700,x
    inx
    bne clear_ram

    ; Clear PPU memory (nametables and attributes)
    jsr clear_ppu

    ; Load palette
    jsr load_palette

    ; Load test pattern background
    jsr load_background

    ; Initialize game state
    lda #$00
    sta frame_count
    sta nmi_ready

    ; Enable rendering
    lda #%10000000  ; Enable NMI, BG from pattern table 0
    sta $2000
    lda #%00011110  ; Enable sprites and background, show left 8 pixels
    sta $2001

main_loop:
    ; Wait for NMI to complete
    lda #$01
    sta nmi_ready
:   lda nmi_ready
    bne :-

    ; Main game logic happens here
    ; For Phase 1, we just loop
    jmp main_loop

nmi_handler:
    ; Save registers
    pha
    txa
    pha
    tya
    pha

    ; Increment frame counter
    inc frame_count

    ; Sprite DMA transfer (copy $0200-$02FF to OAM)
    lda #$00
    sta $2003       ; Set OAM address to 0
    lda #$02        ; High byte of OAM buffer ($0200)
    sta $4014       ; Start DMA transfer

    ; Reset scroll
    lda #$00
    sta $2005       ; X scroll
    sta $2005       ; Y scroll

    ; Signal main loop that NMI is complete
    lda #$00
    sta nmi_ready

    ; Restore registers
    pla
    tay
    pla
    tax
    pla
    rti

irq_handler:
    rti

; ===== SUBROUTINES =====

; Clear PPU memory (nametables and attributes)
clear_ppu:
    lda $2002       ; Reset PPU address latch
    lda #$20
    sta $2006       ; High byte of nametable 0 ($2000)
    lda #$00
    sta $2006       ; Low byte

    ldx #$08        ; 8 pages to clear ($2000-$27FF)
    ldy #$00
    lda #$00
clear_ppu_loop:
    sta $2007
    iny
    bne clear_ppu_loop
    dex
    bne clear_ppu_loop
    rts

; Load palette into PPU
load_palette:
    lda $2002       ; Reset PPU address latch
    lda #$3F
    sta $2006       ; High byte of palette ($3F00)
    lda #$00
    sta $2006       ; Low byte

    ldx #$00
load_palette_loop:
    lda palette_data,x
    sta $2007
    inx
    cpx #$20        ; 32 bytes total (16 BG + 16 sprite)
    bne load_palette_loop
    rts

; Load test pattern background
load_background:
    lda $2002       ; Reset PPU address latch
    lda #$20
    sta $2006       ; High byte of nametable 0 ($2000)
    lda #$00
    sta $2006       ; Low byte

    ; Fill with checkerboard pattern
    ldx #$00
    ldy #$00
load_bg_loop:
    txa
    clc
    adc frame_count
    and #$01
    sta $2007
    inx
    cpx #$20        ; 32 tiles per row
    bne load_bg_loop
    ldx #$00
    iny
    cpy #$1E        ; 30 rows
    bne load_bg_loop
    rts

.segment "RODATA"

; Palette data (32 bytes: 16 background + 16 sprite)
palette_data:
    ; Background palettes
    .byte $0F,$01,$11,$21  ; Palette 0: Black, dark blue, light blue, white
    .byte $0F,$06,$16,$26  ; Palette 1: Black, red shades (for antibodies)
    .byte $0F,$0A,$1A,$2A  ; Palette 2: Black, green shades (for nutrients)
    .byte $0F,$00,$10,$30  ; Palette 3: Black, grayscale

    ; Sprite palettes
    .byte $0F,$0C,$1C,$2C  ; Palette 0: Black, cyan shades (player cells)
    .byte $0F,$06,$16,$26  ; Palette 1: Black, red shades (antibodies)
    .byte $0F,$0A,$1A,$2A  ; Palette 2: Black, green shades (nutrients)
    .byte $0F,$00,$10,$30  ; Palette 3: Black, grayscale (UI)

.segment "CHR"
    ; CHR-ROM data (8KB)
    ; For Phase 1, we'll use simple placeholder tiles
    ; Tile 0: Blank
    .byte $00,$00,$00,$00,$00,$00,$00,$00
    .byte $00,$00,$00,$00,$00,$00,$00,$00

    ; Tile 1: Solid
    .byte $FF,$FF,$FF,$FF,$FF,$FF,$FF,$FF
    .byte $FF,$FF,$FF,$FF,$FF,$FF,$FF,$FF

    ; Fill remaining CHR-ROM with zeros
    .res 8192-32, $00
