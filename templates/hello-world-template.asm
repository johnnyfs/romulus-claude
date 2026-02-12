; MITOSIS PANIC - NES Hello World Template
; This is a minimal NES ROM template for the team to build upon
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

.segment "BSS"
    ; Game variables will go here

.segment "CODE"

reset_handler:
    sei             ; Disable interrupts
    cld             ; Clear decimal mode
    ldx #$FF
    txs             ; Set up stack
    
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
    
    ; Set up PPU
    lda #$00
    sta $2000       ; Disable NMI
    sta $2001       ; Disable rendering
    
    ; TODO: Load palette
    ; TODO: Load background
    ; TODO: Initialize game state
    
    ; Enable rendering
    lda #%10000000  ; Enable NMI
    sta $2000
    lda #%00011110  ; Enable sprites and background
    sta $2001
    
main_loop:
    ; Main game loop happens during NMI
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
    
    ; TODO: Update game logic here
    ; TODO: Update sprites (OAM DMA)
    ; TODO: Update scroll/PPU
    
    ; Restore registers
    pla
    tay
    pla
    tax
    pla
    rti

irq_handler:
    rti

.segment "RODATA"
    ; Palettes, level data, etc. will go here

.segment "CHR"
    ; TODO: Include CHR-ROM data here
    ; For now, fill with zeros
    .res 8192, $00
