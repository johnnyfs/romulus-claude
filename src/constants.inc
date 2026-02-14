; MITOSIS PANIC - Constants and Definitions
; Include this file in main.asm

; ============================================================
; Controller Button Masks
; ============================================================
BUTTON_A      = %10000000
BUTTON_B      = %01000000
BUTTON_SELECT = %00100000
BUTTON_START  = %00010000
BUTTON_UP     = %00001000
BUTTON_DOWN   = %00000100
BUTTON_LEFT   = %00000010
BUTTON_RIGHT  = %00000001

; ============================================================
; PPU Registers
; ============================================================
PPUCTRL   = $2000
PPUMASK   = $2001
PPUSTATUS = $2002
OAMADDR   = $2003
PPUSCROLL = $2005
PPUADDR   = $2006
PPUDATA   = $2007
OAMDMA    = $4014

; ============================================================
; APU/Controller Registers
; ============================================================
JOY1      = $4016
JOY2      = $4017

; ============================================================
; Entity Limits (per TECHNICAL_SPEC.md)
; ============================================================
MAX_CELLS      = 16
MAX_ANTIBODIES = 8
MAX_NUTRIENTS  = 8

; ============================================================
; Entity Data Structure Offsets
; ============================================================
; Cell/Antibody/Nutrient offsets (16 bytes per entity)
ENTITY_ACTIVE = 0
ENTITY_X      = 1
ENTITY_Y      = 2
ENTITY_VX     = 3
ENTITY_VY     = 4
ENTITY_SIZE   = 5
ENTITY_FRAME  = 6
ENTITY_STATE  = 7

; ============================================================
; Memory Addresses
; ============================================================
CELL_DATA      = $0300
ANTIBODY_DATA  = $0400
NUTRIENT_DATA  = $0480
GAME_STATE     = $0500

; ============================================================
; Game Constants
; ============================================================
CELL_SIZE      = 8     ; Cell radius in pixels
CELL_SPEED     = 2     ; Max cell velocity
FRICTION       = 1     ; Velocity decay per frame

ARENA_LEFT     = 16
ARENA_RIGHT    = 240
ARENA_TOP      = 32
ARENA_BOTTOM   = 224
