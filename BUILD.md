# MITOSIS PANIC - Build Instructions

## Prerequisites

- **cc65 toolchain**: ca65 (assembler), ld65 (linker)
  - Install on macOS: `brew install cc65`
  - Install on Linux: `sudo apt-get install cc65`

- **NES Emulator** (for testing):
  - FCEUX (recommended): `brew install fceux`
  - Or Mesen, nestopia, etc.

## Quick Start

```bash
# Build the ROM
make

# Build and run in emulator
make run

# Clean build artifacts
make clean
```

## Project Structure

```
romulus-claude/
├── src/
│   └── main.asm          # Main assembly source code
├── graphics/
│   └── game.chr          # CHR-ROM data (sprites/tiles)
├── build/
│   ├── main.o            # Compiled object file
│   └── mitosis_panic.nes # Final NES ROM (40KB)
├── Makefile              # Build configuration
└── nes.cfg               # Linker configuration (memory map)
```

## Build Process Details

1. **Assembly**: `ca65 src/main.asm -o build/main.o`
   - Assembles 6502 assembly code into object file

2. **Linking**: `ld65 -C nes.cfg build/main.o -o build/mitosis_panic.nes`
   - Links object file using NES memory map configuration
   - Embeds CHR-ROM data from graphics/game.chr
   - Adds iNES header (16 bytes)

3. **Result**: `build/mitosis_panic.nes`
   - 40KB file: 16B header + 32KB PRG-ROM + 8KB CHR-ROM
   - NROM mapper (mapper 0)
   - Ready to run in any NES emulator

## Current Features (Phase 1)

✅ Complete NES initialization sequence
✅ VBlank/NMI handler with 60 FPS timing
✅ Color palette loading (4 background, 4 sprite palettes)
✅ Sprite rendering via OAM DMA
✅ Simple animation (sprite moves across screen)
✅ CHR-ROM graphics integration

## Next Steps (Phase 2)

- [ ] Controller input reading
- [ ] Multiple sprite rendering (2x2 metatiles)
- [ ] Background tile rendering (petri dish arena)
- [ ] Entity data structures (cells, antibodies, nutrients)

## Testing

Run in FCEUX emulator:
```bash
fceux build/mitosis_panic.nes
```

You should see:
- Black screen with a cyan-colored sprite
- Sprite slowly moving to the right
- Smooth 60 FPS animation

## Troubleshooting

**Build Error: "ca65: command not found"**
- Install cc65 toolchain (see Prerequisites)

**Build Error: "graphics/game.chr: No such file"**
- Ensure graphics/game.chr exists
- Graphics Engineer should verify CHR file

**ROM doesn't run in emulator**
- Verify ROM is exactly 40,976 bytes (40KB)
- Check for assembly errors in build output
- Try different emulator (FCEUX, Mesen, nestopia)

## Team Collaboration

- **Chief Engineer**: Main assembly code, build system, core engine
- **Graphics Engineer**: CHR file (graphics/game.chr), sprite design
- **Audio Engineer**: Sound engine integration (future)
- **Integration Engineer**: Asset pipeline, build automation
- **QA Engineer**: Testing, verification, bug reports
