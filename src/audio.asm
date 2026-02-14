; ==============================================================================
; MITOSIS PANIC - Audio System
; ==============================================================================
; Audio wrapper for FamiTone2 sound engine
; Provides simple interface for game code to play music and sound effects
;
; Co-Authored-By: Audio Engineer the Claudette <noreply@anthropic.com>
; ==============================================================================

.segment "CODE"

; ==============================================================================
; Audio System Initialization
; ==============================================================================
; Call once at game startup to initialize the audio engine
; Inputs: None
; Outputs: None
; Destroys: A, X, Y
; ==============================================================================
.proc audio_init
    ; TODO: Initialize FamiTone2 engine
    ; For now, initialize APU directly with basic settings

    ; Disable APU frame interrupt
    LDA #$40
    STA $4017

    ; Enable all channels
    LDA #$0F
    STA $4015

    ; Initialize all channels to silence
    LDA #$30        ; Disable envelopes
    STA $4000       ; Pulse 1
    STA $4004       ; Pulse 2
    LDA #$80
    STA $4008       ; Triangle (silence)
    LDA #$30
    STA $400C       ; Noise

    RTS
.endproc

; ==============================================================================
; Audio Update
; ==============================================================================
; Call once per frame to update music and sound effect playback
; Inputs: None
; Outputs: None
; Destroys: A, X, Y
; ==============================================================================
.proc audio_update
    ; TODO: Call FamiTone2 update routine
    ; For now, this is a stub
    RTS
.endproc

; ==============================================================================
; Sound Effects
; ==============================================================================

; Play nutrient collection sound
; Inputs: None
; Outputs: None
; Destroys: A
.proc sfx_nutrient_collect
    ; TODO: Trigger FamiTone2 SFX #0
    ; Stub: Brief pulse beep on channel 1
    LDA #$8F        ; Volume 15, duty 50%
    STA $4000
    LDA #$FE        ; Low period byte (high pitch)
    STA $4002
    LDA #$00        ; High period byte
    STA $4003
    RTS
.endproc

; Play mitosis event sound
; Inputs: None
; Outputs: None
; Destroys: A
.proc sfx_mitosis
    ; TODO: Trigger FamiTone2 SFX #1
    ; Stub: Rising sweep on pulse 1
    LDA #$8F        ; Volume 15, duty 50%
    STA $4000
    LDA #$87        ; Enable sweep, increase pitch
    STA $4001
    LDA #$80        ; Medium period
    STA $4002
    LDA #$01
    STA $4003
    RTS
.endproc

; Play death/collision sound
; Inputs: None
; Outputs: None
; Destroys: A
.proc sfx_death
    ; TODO: Trigger FamiTone2 SFX #2
    ; Stub: Noise burst
    LDA #$8F        ; Volume 15
    STA $400C
    LDA #$00        ; Noise period
    STA $400E
    LDA #$08        ; Length counter
    STA $400F
    RTS
.endproc

; Play proximity warning sound
; Inputs: None
; Outputs: None
; Destroys: A
.proc sfx_proximity_warning
    ; TODO: Trigger FamiTone2 SFX #3
    ; Stub: High beep on pulse 2
    LDA #$8F        ; Volume 15, duty 50%
    STA $4004
    LDA #$08        ; Very high pitch
    STA $4006
    LDA #$00
    STA $4007
    RTS
.endproc

; ==============================================================================
; Music Playback
; ==============================================================================

; Start main theme music
; Inputs: None
; Outputs: None
; Destroys: A, X
.proc music_play_main
    ; TODO: Load and play main theme via FamiTone2
    ; Stub implementation - no music yet
    RTS
.endproc

; Play level clear fanfare
; Inputs: None
; Outputs: None
; Destroys: A, X
.proc music_play_level_clear
    ; TODO: Load and play level clear jingle via FamiTone2
    ; Stub implementation
    RTS
.endproc

; Stop all music
; Inputs: None
; Outputs: None
; Destroys: A
.proc music_stop
    ; TODO: Stop FamiTone2 music
    ; Stub: Silence all channels
    LDA #$30
    STA $4000
    STA $4004
    LDA #$80
    STA $4008
    LDA #$30
    STA $400C
    RTS
.endproc

; ==============================================================================
; Public API Summary
; ==============================================================================
; audio_init              - Initialize audio system (call at startup)
; audio_update            - Update audio (call every frame)
;
; sfx_nutrient_collect    - Play nutrient collection sound
; sfx_mitosis             - Play mitosis division sound
; sfx_death               - Play death/collision sound
; sfx_proximity_warning   - Play enemy proximity warning
;
; music_play_main         - Start main theme loop
; music_play_level_clear  - Play level clear fanfare
; music_stop              - Stop all music
; ==============================================================================
