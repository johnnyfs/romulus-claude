# NES Development Quick Reference

## Essential NES Hardware Specs

### CPU: Ricoh 2A03 (6502-based)
- Clock speed: 1.79 MHz (NTSC)
- 8-bit processor
- 64KB addressable memory

### PPU (Picture Processing Unit): 2C02
- Resolution: 256x240 pixels
- 52-color palette (64 total, some identical)
- 2 pattern tables (sprites + background)
- 2 nametables (screen layouts)
- 8 sprites per scanline maximum
- 64 total sprites (256 bytes OAM)

### APU (Audio Processing Unit)
- 2 pulse wave channels (square waves)
- 1 triangle wave channel
- 1 noise channel
- 1 DMC sample channel

### Memory Map
```
$0000-$07FF: 2KB internal RAM
$0800-$1FFF: Mirrors of RAM
$2000-$2007: PPU registers (mirrored to $3FFF)
$4000-$4017: APU & I/O registers
$4018-$4FFF: APU & I/O test mode
$5000-$5FFF: Cartridge expansion (rare)
$6000-$7FFF: SRAM (battery-backed save data)
$8000-$FFFF: PRG-ROM (cartridge program data)
```

### PPU Registers
- $2000 (PPUCTRL): PPU control
- $2001 (PPUMASK): PPU mask (show/hide sprites/bg)
- $2002 (PPUSTATUS): PPU status (VBlank flag)
- $2003 (OAMADDR): OAM address
- $2004 (OAMDATA): OAM data
- $2005 (PPUSCROLL): Scroll position
- $2006 (PPUADDR): PPU address
- $2007 (PPUDATA): PPU data

### APU Registers
- $4000-$4003: Pulse 1
- $4004-$4007: Pulse 2
- $4008-$400B: Triangle
- $400C-$400F: Noise
- $4010-$4013: DMC
- $4015: APU status/enable
- $4017: APU frame counter

## iNES ROM Header (16 bytes)

```
Offset  Size  Description
------  ----  -----------
0       4     "NES" followed by MS-DOS EOF ($1A)
4       1     Number of 16KB PRG-ROM banks
5       1     Number of 8KB CHR-ROM banks
6       1     Flags 6 (Mapper, mirroring, battery, trainer)
7       1     Flags 7 (Mapper, VS, PlayChoice, NES 2.0)
8       1     Flags 8 (PRG-RAM size)
9       1     Flags 9 (TV system)
10      1     Flags 10 (unofficial)
11-15   5     Unused padding (zeros)
```

### Example Header (NROM, 32KB PRG, 8KB CHR)
```
4E 45 53 1A  ; "NES" + EOF
02           ; 2 × 16KB PRG banks = 32KB
01           ; 1 × 8KB CHR bank
00           ; Horizontal mirroring, no SRAM
00           ; Mapper 0 (NROM)
00 00 00 00 00 00 00 00  ; Zeros
```

## VBlank and Timing

### Frame Structure (NTSC)
- 60 frames per second
- ~16.67ms per frame
- 262 scanlines total
- Scanlines 0-239: Visible
- Scanline 240: Post-render (idle)
- Scanlines 241-260: VBlank period
- Scanline 261: Pre-render

### VBlank Period
- Only safe time to update PPU
- ~2.27ms window (20 scanlines × 113.67 CPU cycles)
- Use for: OAM DMA, palette updates, nametable changes

### NMI (Non-Maskable Interrupt)
- Triggered at start of VBlank (scanline 241)
- Must be fast (<2ms) to finish before VBlank ends
- Typical NMI tasks:
  1. OAM DMA transfer ($4014)
  2. Update scroll registers
  3. Set VBlank flag for main loop
  4. Return

## Sprite System

### OAM (Object Attribute Memory)
- 64 sprites × 4 bytes = 256 bytes
- Located at PPU $00-$FF

### Sprite Format (4 bytes each)
```
Byte 0: Y position (0-239)
Byte 1: Tile number (0-255)
Byte 2: Attributes
        76543210
        ||||||||
        ||||||++- Palette (0-3)
        |||+++--- Unused
        ||+------ Priority (0: front, 1: behind bg)
        |+------- Flip horizontally
        +-------- Flip vertically
Byte 3: X position (0-255)
```

### OAM DMA
```assembly
LDA #$02        ; High byte of OAM buffer ($0200)
STA $4014       ; Trigger DMA (takes 513 CPU cycles)
```

## CHR-ROM Format

### Pattern Tables
- 2 tables × 4KB = 8KB total
- $0000-$0FFF: Pattern table 0 (often sprites)
- $1000-$1FFF: Pattern table 1 (often background)

### Tile Format
- Each tile: 8×8 pixels
- 16 bytes per tile (2 bitplanes)
- 2 bits per pixel = 4 colors

### Tile Structure
```
Bitplane 0 (8 bytes): Low bit of each pixel
Bitplane 1 (8 bytes): High bit of each pixel

Example tile (one row):
Bitplane 0: 00111100 (binary)
Bitplane 1: 01111110 (binary)
Result:     01233210 (palette indices)
```

## Palettes

### Palette Memory
- $3F00-$3F1F: 32 bytes
- $3F00-$3F0F: Background palettes (4 × 4 colors)
- $3F10-$3F1F: Sprite palettes (4 × 4 colors)
- $3F00, $3F10: Universal background color (mirrored)

### Common NES Colors (Hex Codes)
```
$0F: Black          $00: Gray          $10: Light gray     $30: White
$01: Dark blue      $11: Medium blue   $21: Light blue     $31: Pale blue
$02: Dark purple    $12: Medium purple $22: Light purple   $32: Pale purple
$06: Dark red       $16: Medium red    $26: Light red      $36: Pale red
$0A: Dark green     $1A: Medium green  $2A: Light green    $3A: Pale green
$28: Yellow         $38: Light yellow
```

## cc65 Essentials

### Compiling C to NES
```bash
# Compile C to assembly
cc65 -O -t nes game.c -o game.s

# Assemble to object
ca65 game.s -o game.o

# Link to NES ROM
ld65 -C nes.cfg game.o nes.lib -o game.nes
```

### Minimal C Program Structure
```c
// game.c
#include <nes.h>

void main(void) {
    // Disable rendering
    PPU.control = 0;
    PPU.mask = 0;
    
    // Load palette
    PPU.vram.address = 0x3F;
    PPU.vram.address = 0x00;
    PPU.vram.data = 0x0F;  // Black background
    
    // Enable rendering
    PPU.control = 0x80;    // Enable NMI
    PPU.mask = 0x1E;       // Show sprites and background
    
    // Main loop
    while(1) {
        // Wait for VBlank
        waitvsync();
        
        // Game logic here
    }
}

// NMI handler (called every VBlank)
void nmi(void) {
    // OAM DMA
    PPU.oam.dma = 0x02;  // Transfer from $0200
}
```

### neslib.h Common Functions
```c
ppu_off();              // Disable PPU rendering
ppu_on_all();           // Enable sprites + background
ppu_on_bg();            // Enable background only
ppu_on_spr();           // Enable sprites only
waitvsync();            // Wait for next VBlank
pal_bg(const char *data); // Load background palette
pal_spr(const char *data); // Load sprite palette
vram_adr(unsigned int adr); // Set PPU address
vram_put(unsigned char n);  // Write byte to PPU
oam_spr(x, y, tile, attr);  // Set sprite
oam_clear();            // Clear all sprites
```

## Common Patterns

### Game Loop
```c
void main(void) {
    init_game();
    
    while(1) {
        waitvsync();           // Wait for VBlank/NMI
        
        read_controller();     // Read input
        update_game_logic();   // Update state
        update_sprites();      // Prepare sprite data
        
        // OAM transfer happens in NMI
    }
}
```

### Controller Reading
```assembly
; Read controller 1
LDA #$01
STA $4016      ; Strobe controller
LDA #$00
STA $4016      ; End strobe

; Read 8 buttons (A, B, Select, Start, Up, Down, Left, Right)
LDX #$08
loop:
    LDA $4016  ; Read one button
    LSR A      ; Shift bit 0 into carry
    ROL buttons ; Rotate into buttons variable
    DEX
    BNE loop
```

### Random Number Generator (LCG)
```c
unsigned int seed = 1234;

unsigned int rand() {
    seed = (seed * 75) + 74;
    return seed >> 8;  // Return high byte
}
```

### AABB Collision Detection
```c
char check_collision(char x1, char y1, char w1, char h1,
                     char x2, char y2, char w2, char h2) {
    return (x1 < x2 + w2 &&
            x1 + w1 > x2 &&
            y1 < y2 + h2 &&
            y1 + h1 > y2);
}
```

## Debugging Tips

### Common Issues
1. **Black screen**: Check PPU enable bits in $2001
2. **Garbage graphics**: Ensure CHR-ROM properly linked
3. **Sprites not appearing**: Check OAM DMA, sprite Y position
4. **Glitchy graphics**: VBlank overrun (NMI too slow)
5. **Slowdown**: Too much processing in main loop

### FCEUX Debugger
- F7: Step into (CPU)
- F8: Step over (CPU)
- F9: Step out (CPU)
- Hex Editor: View/edit RAM
- PPU Viewer: View pattern tables, nametables
- Name Table Viewer: See current screen
- Trace Logger: Log CPU instructions

### Debug Techniques
```c
// Visual debugging - use background color
PPU.vram.address = 0x3F;
PPU.vram.address = 0x00;
PPU.vram.data = 0x16;  // Change to red when bug occurs
```

## Build System Example (Makefile)

```makefile
CC = cc65
AS = ca65
LD = ld65

CFLAGS = -O -t nes
ASFLAGS = -t nes
LDFLAGS = -C nes.cfg

all: game.nes

game.s: game.c
	$(CC) $(CFLAGS) game.c -o game.s

game.o: game.s
	$(AS) $(ASFLAGS) game.s -o game.o

game.nes: game.o
	$(LD) $(LDFLAGS) game.o nes.lib -o game.nes

clean:
	rm -f *.o *.s game.nes

run: game.nes
	fceux game.nes
```

## Resources

### Official Documentation
- NESdev Wiki: https://www.nesdev.org/wiki/
- cc65 Documentation: https://cc65.github.io/doc/

### Tools
- FCEUX: Emulator with debugging
- Mesen: Cycle-accurate emulator
- YY-CHR: CHR graphics editor
- NES Screen Tool: Level/tile editor
- FamiTracker: Music composition

### Code Examples
- NES "Hello World": https://github.com/pinobatch/nrom-template
- neslib examples: Included with cc65

---
**Created by**: Game Designer  
**For**: MITOSIS PANIC development team  
**Last Updated**: 2026-02-11
