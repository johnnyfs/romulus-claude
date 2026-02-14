; MITOSIS PANIC - Sound Effects Data (PLACEHOLDER/STUB)
; FamiTone2 format
;
; *** PLACEHOLDER FILE ***
; This file contains minimal stub data for initial audio engine integration.
; Real sound effects will be exported from FamiTracker .ftm files.
; See audio/sfx/SFX_DESIGN.md for complete specifications.
;
; Generated manually as placeholder - NOT from text2data tool
; Replace with actual FamiTone2 exports when .ftm files are created

.export sfx_data

.segment "RODATA"

; SFX ID constants (define these in your game code):
; SFX_MITOSIS       = 0   ; Cell division
; SFX_NUTRIENT_A    = 1   ; Green nutrient
; SFX_NUTRIENT_B    = 2   ; Yellow nutrient
; SFX_NUTRIENT_C    = 3   ; Pink nutrient
; SFX_ANTIBODY_WARN = 4   ; Antibody spawn
; SFX_DAMAGE        = 5   ; Damage pulse
; SFX_DAMAGE_NOISE  = 6   ; Damage noise
; SFX_GAME_OVER     = 7   ; Game over jingle

sfx_data:
    ; Pointer table to each sound effect
    .word @sfx0_mitosis
    .word @sfx1_nutrient_a
    .word @sfx2_nutrient_b
    .word @sfx3_nutrient_c
    .word @sfx4_antibody_warn
    .word @sfx5_damage
    .word @sfx6_damage_noise
    .word @sfx7_game_over

; SFX 0: Cell Mitosis (stub - simple rising beep)
@sfx0_mitosis:
    .byte $9E       ; Channel: Pulse 1
    .byte $01       ; Length: 1 frame
    .byte $8F       ; Note: C-4, volume F
    .byte $00       ; End marker
    .byte $FF       ; End of SFX

; SFX 1: Nutrient Collection A (stub - short beep)
@sfx1_nutrient_a:
    .byte $9E       ; Channel: Pulse 1
    .byte $01       ; Length: 1 frame
    .byte $8E       ; Note: E-4, volume E
    .byte $00       ; End marker
    .byte $FF       ; End of SFX

; SFX 2: Nutrient Collection B (stub - short beep, higher)
@sfx2_nutrient_b:
    .byte $9E       ; Channel: Pulse 1
    .byte $01       ; Length: 1 frame
    .byte $8D       ; Note: A-4, volume D
    .byte $00       ; End marker
    .byte $FF       ; End of SFX

; SFX 3: Nutrient Collection C (stub - short beep, descending)
@sfx3_nutrient_c:
    .byte $9E       ; Channel: Pulse 1
    .byte $01       ; Length: 1 frame
    .byte $8C       ; Note: C-5, volume C
    .byte $00       ; End marker
    .byte $FF       ; End of SFX

; SFX 4: Antibody Spawn Warning (stub - low ominous tone)
@sfx4_antibody_warn:
    .byte $BE       ; Channel: Pulse 2
    .byte $02       ; Length: 2 frames
    .byte $8C       ; Note: F-3, volume C
    .byte $8C       ; Note: F-3, volume C
    .byte $00       ; End marker
    .byte $FF       ; End of SFX

; SFX 5: Damage Pulse (stub - falling sweep)
@sfx5_damage:
    .byte $9E       ; Channel: Pulse 1
    .byte $02       ; Length: 2 frames
    .byte $8F       ; Note: A-4, volume F
    .byte $85       ; Note: F-3, volume 5
    .byte $00       ; End marker
    .byte $FF       ; End of SFX

; SFX 6: Damage Noise (stub - noise burst)
@sfx6_damage_noise:
    .byte $FE       ; Channel: Noise
    .byte $01       ; Length: 1 frame
    .byte $8F       ; Period: 2, volume F
    .byte $00       ; End marker
    .byte $FF       ; End of SFX

; SFX 7: Game Over (stub - descending sequence)
@sfx7_game_over:
    .byte $9E       ; Channel: Pulse 1
    .byte $04       ; Length: 4 frames
    .byte $8E       ; Note: E-4, volume E
    .byte $8D       ; Note: D-4, volume D
    .byte $8C       ; Note: C-4, volume C
    .byte $8A       ; Note: A-3, volume A
    .byte $00       ; End marker
    .byte $FF       ; End of SFX

; End of SFX data
