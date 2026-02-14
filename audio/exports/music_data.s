; MITOSIS PANIC - Music Data (PLACEHOLDER/STUB)
; FamiTone2 format
;
; *** PLACEHOLDER FILE ***
; This file contains minimal stub data for initial audio engine integration.
; Real music will be exported from FamiTracker .ftm files.
; See audio/music/MUSIC_DESIGN.md for complete "Cellular Division" specifications.
;
; Generated manually as placeholder - NOT from text2data tool
; Replace with actual FamiTone2 exports when .ftm files are created

.export music_data

.segment "RODATA"

; Music track constants (define in your game code):
; MUSIC_MAIN_THEME  = 0   ; "Cellular Division" - main gameplay

music_data:
    ; Song pointer table
    .word @song0_start
    .word @song0_loop

; Song 0: Main Theme (stub - simple repeating pattern)
; In real implementation, this will be a 32-bar arcade theme at 140 BPM
@song0_start:
@song0_loop:
    ; Frame header
    .byte $FB       ; Tempo marker
    .byte $06       ; Speed: 6 (NTSC default)
    .byte $8C       ; Tempo: 140 BPM (placeholder)

    ; Row 0 - Simple C major chord
    .byte $01       ; Pulse 1: Play note
    .byte $0C       ; Note: C-4
    .byte $0F       ; Volume: F

    .byte $41       ; Pulse 2: Play note
    .byte $10       ; Note: E-4 (third)
    .byte $0D       ; Volume: D

    .byte $81       ; Triangle: Play note
    .byte $00       ; Note: C-2 (bass)

    .byte $C1       ; Noise: Play percussion
    .byte $02       ; Period: 2 (hi-hat)
    .byte $08       ; Volume: 8

    ; Row 1 - Rest/continue
    .byte $02       ; Pulse 1: Continue
    .byte $42       ; Pulse 2: Continue
    .byte $82       ; Triangle: Continue
    .byte $C2       ; Noise: Rest

    ; Row 2 - Variation
    .byte $01       ; Pulse 1: Play note
    .byte $0E       ; Note: E-4
    .byte $0E       ; Volume: E

    .byte $41       ; Pulse 2: Play note
    .byte $13       ; Note: G-4
    .byte $0C       ; Volume: C

    .byte $81       ; Triangle: Play note
    .byte $07       ; Note: G-2

    .byte $C1       ; Noise: Play percussion
    .byte $02       ; Period: 2
    .byte $08       ; Volume: 8

    ; Row 3 - Rest/continue
    .byte $02       ; Pulse 1: Continue
    .byte $42       ; Pulse 2: Continue
    .byte $82       ; Triangle: Continue
    .byte $C2       ; Noise: Rest

    ; Row 4-7: Repeat pattern (simplified)
    .byte $01, $0C, $0F   ; Pulse 1: C-4
    .byte $41, $10, $0D   ; Pulse 2: E-4
    .byte $81, $00        ; Triangle: C-2
    .byte $C1, $02, $08   ; Noise: hi-hat
    .byte $02, $42, $82, $C2  ; Continue

    .byte $01, $0E, $0E   ; Pulse 1: E-4
    .byte $41, $13, $0C   ; Pulse 2: G-4
    .byte $81, $07        ; Triangle: G-2
    .byte $C1, $02, $08   ; Noise: hi-hat
    .byte $02, $42, $82, $C2  ; Continue

    ; Loop marker - jump back to @song0_loop
    .byte $FD       ; Loop command
    .word @song0_loop  ; Absolute address (FamiTone2 handles the offset)

    .byte $FF       ; End marker (shouldn't reach if loop works)

; End of music data

; NOTE: This is a MINIMAL stub pattern that will loop 8 simple beats.
; The real "Cellular Division" theme will be a 32-bar composition with:
; - Complex melodic patterns and harmonies
; - Section structure (A-B-A-B' with breakdown)
; - Organic "burbling" rhythms
; - Proper instruments and envelopes
; - Seamless loop point
; See audio/music/MUSIC_DESIGN.md for full specifications
