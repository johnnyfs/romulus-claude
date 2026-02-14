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
# Check build dependencies
make check

# Build the ROM
make

# Build and run in emulator
make run
# or: make test (alias)

# Clean build artifacts
make clean

# Show build information
make info
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

## Build Targets

The Makefile provides the following targets:

- `make` or `make all` - Build the ROM (default)
- `make run` - Build and launch in FCEUX emulator
- `make test` - Alias for `make run`
- `make clean` - Remove build artifacts (*.o, *.nes, *.map)
- `make check` - Verify build dependencies are installed
- `make info` - Display project information and available targets
- `make help` - Alias for `make info`

## Advanced Usage

### Multiple Source Files

The build system automatically detects all `.asm` files in the `src/` directory:

```bash
# All .asm files are assembled and linked automatically
src/main.asm
src/sprites.asm     # Future modular code
src/entities.asm    # Future modular code
```

### Memory Map

The `mitosis_panic.map` file shows memory allocation after linking:

```bash
# View memory map
cat build/mitosis_panic.map
```

This is useful for:
- Debugging memory layout issues
- Verifying segment placement
- Optimizing code size

### Debug Builds

Debug symbols are enabled by default (`-g` flag). To use them:

```bash
# Build with debug info (default)
make

# Use debugger (Mesen recommended for best debugging)
mesen build/mitosis_panic.nes
```

## Asset Integration

### Graphics (CHR-ROM)

The CHR file is embedded automatically during linking:
- Location: `graphics/game.chr`
- Size: Exactly 8192 bytes (8KB)
- Format: Raw NES CHR-ROM data

See `graphics/CHR_MAP.md` for tile organization and `ASSET_PIPELINE.md` for creation workflow.

### Audio (Future)

FamiTone2 audio integration is planned:
- Music: `audio/music/*.txt` (FamiTone2 format)
- SFX: `audio/sfx/*.txt` (FamiTone2 format)

Audio Engineer will integrate FamiTone2 engine and provide assembly includes.

## Team Collaboration

- **Chief Engineer**: Main assembly code, build system, core engine
- **Graphics Engineer**: CHR file (graphics/game.chr), sprite design, tile mapping
- **Audio Engineer**: Sound engine integration (FamiTone2)
- **Integration Engineer**: Asset pipeline, build automation, documentation
- **QA Engineer**: Testing, verification, bug reports

---

**Build System Version**: 1.0
**Last Updated**: 2026-02-14
**Maintainer**: Integration Engineer
