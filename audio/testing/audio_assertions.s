; MITOSIS PANIC - Audio System Assertions
; Runtime validation checks for audio integration
;
; Purpose: Catch audio bugs at runtime with immediate feedback
; Usage: Include in debug builds, conditionally compiled
;
; These assertions verify audio state and catch bugs that would
; otherwise cause silent failures or subtle glitches.

.ifdef DEBUG_AUDIO

; ============================================================================
; ASSERTION MACROS
; ============================================================================

; Assert that a condition is true, halt if false
; Usage: AUDIO_ASSERT condition, error_code
.macro AUDIO_ASSERT condition, error_code
    .local @skip_assert
    condition                   ; Test condition
    bne @skip_assert           ; Skip if true
    lda #error_code
    jsr audio_assertion_failed
@skip_assert:
.endmacro

; ============================================================================
; ERROR CODES
; ============================================================================

AUDIO_ERR_NOT_INIT          = $01   ; FamiTone2 not initialized
AUDIO_ERR_BAD_SFX_ID        = $02   ; Invalid SFX ID (> 7)
AUDIO_ERR_BAD_CHANNEL       = $03   ; Invalid channel ID (> 3)
AUDIO_ERR_BAD_MUSIC_ID      = $04   ; Invalid music track ID
AUDIO_ERR_NULL_POINTER      = $05   ; Null music/SFX data pointer
AUDIO_ERR_UPDATE_NOT_CALLED = $06   ; FamiToneUpdate not called this frame
AUDIO_ERR_CORRUPTED_RAM     = $07   ; FT_BASE_ADR corrupted
AUDIO_ERR_APU_DISABLED      = $08   ; APU channels not enabled

; ============================================================================
; STATE TRACKING
; ============================================================================

.segment "BSS"

audio_initialized:      .res 1  ; 0 = not init, 1 = initialized
audio_frame_counter:    .res 1  ; Incremented by FamiToneUpdate
audio_last_check_frame: .res 1  ; Last frame assertions ran

.segment "ZEROPAGE"
audio_debug_temp:       .res 1  ; Temp for assertions

; ============================================================================
; INITIALIZATION ASSERTION
; ============================================================================

; Call this AFTER FamiToneInit to mark audio as initialized
audio_mark_initialized:
    lda #1
    sta audio_initialized
    lda #0
    sta audio_frame_counter
    sta audio_last_check_frame
    rts

; ============================================================================
; FRAME UPDATE ASSERTION
; ============================================================================

; Call this FROM FamiToneUpdate to track updates
audio_mark_frame_update:
    inc audio_frame_counter
    rts

; ============================================================================
; SFX TRIGGER ASSERTIONS
; ============================================================================

; Validate SFX parameters before calling FamiToneSfxPlay
; Call: A = SFX ID, X = channel
; Returns: Same A, X if valid; halts if invalid
audio_assert_sfx_params:
    ; Check initialization
    pha
    lda audio_initialized
    AUDIO_ASSERT audio_initialized, AUDIO_ERR_NOT_INIT
    pla

    ; Check SFX ID range (0-7)
    cmp #8
    bcc @sfx_id_ok
    AUDIO_ASSERT #0, AUDIO_ERR_BAD_SFX_ID
@sfx_id_ok:

    ; Check channel ID range (0-3)
    pha
    txa
    cmp #4
    bcc @channel_ok
    AUDIO_ASSERT #0, AUDIO_ERR_BAD_CHANNEL
@channel_ok:
    pla

    rts

; ============================================================================
; MUSIC TRIGGER ASSERTIONS
; ============================================================================

; Validate music track ID before calling FamiToneMusicPlay
; Call: A = music track ID
; Returns: Same A if valid; halts if invalid
audio_assert_music_params:
    ; Check initialization
    pha
    lda audio_initialized
    AUDIO_ASSERT audio_initialized, AUDIO_ERR_NOT_INIT
    pla

    ; Check music ID range (0-1 for MVP, only track 0 used)
    cmp #2
    bcc @music_id_ok
    AUDIO_ASSERT #0, AUDIO_ERR_BAD_MUSIC_ID
@music_id_ok:

    rts

; ============================================================================
; DATA POINTER ASSERTIONS
; ============================================================================

; Verify music_data pointer is not null
audio_assert_music_data:
    lda music_data
    ora music_data+1
    AUDIO_ASSERT music_data, AUDIO_ERR_NULL_POINTER
    rts

; Verify sfx_data pointer is not null
audio_assert_sfx_data:
    lda sfx_data
    ora sfx_data+1
    AUDIO_ASSERT sfx_data, AUDIO_ERR_NULL_POINTER
    rts

; ============================================================================
; FRAME UPDATE CHECK
; ============================================================================

; Verify FamiToneUpdate was called this frame
; Call this at END of game frame, before next VBlank
audio_assert_update_called:
    lda audio_frame_counter
    cmp audio_last_check_frame
    beq @not_updated
    sta audio_last_check_frame
    rts

@not_updated:
    AUDIO_ASSERT #0, AUDIO_ERR_UPDATE_NOT_CALLED
    rts

; ============================================================================
; MEMORY CORRUPTION CHECK
; ============================================================================

; Verify FT_BASE_ADR hasn't been corrupted by checking sentinel values
; This is a heuristic check - looks for obviously wrong values
audio_assert_ram_integrity:
    ; Check first few bytes of FT_BASE_ADR for non-zero
    ; (FamiTone2 initializes these during init)
    lda FT_BASE_ADR
    ora FT_BASE_ADR+1
    ora FT_BASE_ADR+2
    AUDIO_ASSERT FT_BASE_ADR, AUDIO_ERR_CORRUPTED_RAM
    rts

; ============================================================================
; APU STATUS CHECK
; ============================================================================

; Verify APU channels are enabled in $4015
audio_assert_apu_enabled:
    lda $4015
    and #%00001111              ; Mask Pulse1, Pulse2, Triangle, Noise
    AUDIO_ASSERT $4015, AUDIO_ERR_APU_DISABLED
    rts

; ============================================================================
; ASSERTION FAILURE HANDLER
; ============================================================================

; Called when an assertion fails
; A = error code
audio_assertion_failed:
    ; Store error code for debugging
    sta $0200                   ; OAM location (visible in debugger)

    ; Infinite loop with error code in A
    ; In FCEUX, this will show up in debugger
@halt:
    jmp @halt

; ============================================================================
; COMPREHENSIVE VALIDATION ROUTINE
; ============================================================================

; Run all non-intrusive assertions
; Call this periodically during gameplay (e.g., once per second)
audio_validate_all:
    jsr audio_assert_music_data
    jsr audio_assert_sfx_data
    jsr audio_assert_ram_integrity
    jsr audio_assert_apu_enabled
    rts

; ============================================================================
; INTEGRATION EXAMPLES
; ============================================================================

; Example: Wrap FamiToneSfxPlay with assertions
play_sfx_safe:
    ; A = SFX ID, X = channel (caller sets these)
    jsr audio_assert_sfx_params     ; Validate before call
    jsr FamiToneSfxPlay             ; Actual audio call
    rts

; Example: Wrap FamiToneMusicPlay with assertions
play_music_safe:
    ; A = music track ID (caller sets)
    jsr audio_assert_music_params   ; Validate before call
    jsr FamiToneMusicPlay           ; Actual audio call
    rts

; Example: FamiToneUpdate wrapper with tracking
famitone_update_debug:
    jsr FamiToneUpdate              ; Actual update
    jsr audio_mark_frame_update     ; Track update
    rts

; Example: End-of-frame validation
end_of_frame_checks:
    jsr audio_assert_update_called  ; Verify update happened
    ; ... other end-of-frame checks ...
    rts

; Example: Periodic comprehensive check (every 60 frames)
periodic_audio_check:
    lda frame_counter
    and #%00111111              ; Every 64 frames (~1 second)
    bne @skip
    jsr audio_validate_all
@skip:
    rts

.endif  ; DEBUG_AUDIO

; ============================================================================
; RELEASE BUILD STUBS
; ============================================================================

; In release builds, these become no-ops
.ifndef DEBUG_AUDIO

audio_mark_initialized:
audio_mark_frame_update:
audio_assert_sfx_params:
audio_assert_music_params:
audio_assert_music_data:
audio_assert_sfx_data:
audio_assert_update_called:
audio_assert_ram_integrity:
audio_assert_apu_enabled:
audio_validate_all:
    rts

.endif

; ============================================================================
; NOTES
; ============================================================================

;; USAGE IN GAME CODE:
;;
;; 1. Define DEBUG_AUDIO in debug builds:
;;    ca65 -D DEBUG_AUDIO game.s
;;
;; 2. Call audio_mark_initialized after FamiToneInit:
;;    jsr FamiToneInit
;;    jsr FamiToneSfxInit
;;    jsr audio_mark_initialized
;;
;; 3. Wrap FamiToneUpdate with debug tracking:
;;    NMI:
;;        jsr famitone_update_debug   ; Instead of FamiToneUpdate
;;
;; 4. Use safe wrappers for audio calls:
;;    jsr play_sfx_safe           ; Instead of FamiToneSfxPlay
;;    jsr play_music_safe         ; Instead of FamiToneMusicPlay
;;
;; 5. Add end-of-frame check:
;;    main_loop:
;;        ; ... game logic ...
;;        jsr end_of_frame_checks
;;        jmp main_loop
;;
;; 6. Add periodic validation:
;;    main_loop:
;;        jsr periodic_audio_check
;;        ; ... game logic ...
;;
;; BENEFITS:
;; - Catches audio bugs immediately at runtime
;; - Provides clear error codes for debugging
;; - Zero overhead in release builds (compiled out)
;; - Validates assumptions continuously
;; - Detects memory corruption early
;;
;; ERROR CODES:
;; $01 - Audio not initialized (forgot FamiToneInit?)
;; $02 - Bad SFX ID (> 7, invalid constant?)
;; $03 - Bad channel (> 3, wrong FT_SFX_CH value?)
;; $04 - Bad music ID (> 1, invalid track?)
;; $05 - Null pointer (music/SFX data not linked?)
;; $06 - Update not called (FamiToneUpdate missing in NMI?)
;; $07 - RAM corrupted (stack overflow? memory conflict?)
;; $08 - APU disabled ($4015 not set during init?)
