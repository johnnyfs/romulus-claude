; MITOSIS PANIC - Audio System Constants
; For use with FamiTone2 sound engine
;
; Include this file in your main game source to define
; all audio-related constants and configuration

; ============================================================================
; FAMITONE2 CONFIGURATION
; ============================================================================

; Set these BEFORE including famitone2.s
FT_PAL_SUPPORT    = 0      ; 0 = NTSC only, 1 = PAL support
FT_SFX_STREAMS    = 4      ; Number of simultaneous SFX (1-4)
FT_THREAD         = 1      ; Thread-safe mode
FT_DPCM_ENABLE    = 0      ; 0 = no DPCM samples (saves ROM)
FT_DPCM_OFF       = $c000  ; DPCM data location (if enabled)

; ============================================================================
; SOUND EFFECT IDs
; ============================================================================

SFX_MITOSIS       = 0   ; Cell division (rising pulse sweep)
SFX_NUTRIENT_A    = 1   ; Green nutrient pickup
SFX_NUTRIENT_B    = 2   ; Yellow nutrient pickup
SFX_NUTRIENT_C    = 3   ; Pink nutrient pickup
SFX_ANTIBODY_WARN = 4   ; Antibody spawn warning
SFX_DAMAGE        = 5   ; Damage pulse sweep
SFX_DAMAGE_NOISE  = 6   ; Damage noise burst
SFX_GAME_OVER     = 7   ; Game over jingle

; ============================================================================
; CHANNEL CONSTANTS (for FamiToneSfxPlay)
; ============================================================================

FT_SFX_CH0 = 0  ; Pulse 1 channel
FT_SFX_CH1 = 1  ; Pulse 2 channel
FT_SFX_CH2 = 2  ; Triangle channel
FT_SFX_CH3 = 3  ; Noise channel

; ============================================================================
; MUSIC TRACK IDs
; ============================================================================

MUSIC_MAIN_THEME  = 0   ; "Cellular Division" - main gameplay theme
MUSIC_FAST_THEME  = 1   ; Fast variant (future - 160 BPM)

; ============================================================================
; MEMORY RESERVATIONS
; ============================================================================

; Reserve these in your main game source:
;
; .segment "ZEROPAGE"
; FT_TEMP: .res 3
;
; .segment "BSS"
; FT_BASE_ADR: .res 186

; ============================================================================
; USAGE EXAMPLES
; ============================================================================

; In your game initialization code:
;
;   ; Initialize FamiTone2
;   lda #0                      ; 0 = NTSC
;   ldx #<music_data
;   ldy #>music_data
;   jsr FamiToneInit
;
;   ; Initialize SFX
;   ldx #<sfx_data
;   ldy #>sfx_data
;   jsr FamiToneSfxInit
;
;   ; Start background music
;   lda #MUSIC_MAIN_THEME
;   jsr FamiToneMusicPlay

; In your NMI handler:
;
;   jsr FamiToneUpdate          ; Call every frame (60 Hz)

; When cell divides (mitosis event):
;
;   lda #SFX_MITOSIS
;   ldx #FT_SFX_CH0             ; Pulse 1
;   jsr FamiToneSfxPlay

; When nutrient collected:
;
;   lda nutrient_color          ; 0=green, 1=yellow, 2=pink
;   clc
;   adc #SFX_NUTRIENT_A         ; Add to base SFX ID
;   ldx #FT_SFX_CH0
;   jsr FamiToneSfxPlay

; When player takes damage:
;
;   lda #SFX_DAMAGE
;   ldx #FT_SFX_CH0             ; Pulse sweep
;   jsr FamiToneSfxPlay
;   lda #SFX_DAMAGE_NOISE
;   ldx #FT_SFX_CH3             ; Noise burst
;   jsr FamiToneSfxPlay         ; Play both simultaneously

; When antibody spawns:
;
;   lda #SFX_ANTIBODY_WARN
;   ldx #FT_SFX_CH1             ; Pulse 2 (doesn't interrupt melody)
;   jsr FamiToneSfxPlay

; When game over:
;
;   jsr FamiToneMusicStop       ; Stop music first
;   lda #SFX_GAME_OVER
;   ldx #FT_SFX_CH0
;   jsr FamiToneSfxPlay

; ============================================================================
; END OF CONSTANTS
; ============================================================================
