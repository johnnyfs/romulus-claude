# Makefile for MITOSIS PANIC NES ROM

# Tools
AS = ca65
LD = ld65
EMU = fceux

# Assembler and linker flags
AS_FLAGS = -g -t nes
LD_FLAGS = -C $(CFG) -m $(BUILD_DIR)/mitosis_panic.map

# Directories
SRC_DIR = src
BUILD_DIR = build
GRAPHICS_DIR = graphics
AUDIO_DIR = audio
TEMPLATES_DIR = .

# Files
TARGET = $(BUILD_DIR)/mitosis_panic.nes
ASM_SOURCES = $(wildcard $(SRC_DIR)/*.asm)
ASM_OBJECTS = $(patsubst $(SRC_DIR)/%.asm,$(BUILD_DIR)/%.o,$(ASM_SOURCES))
CFG = nes.cfg
CHR_FILE = $(GRAPHICS_DIR)/game.chr

# Colors for output
COLOR_RESET = \033[0m
COLOR_GREEN = \033[32m
COLOR_BLUE = \033[34m
COLOR_YELLOW = \033[33m

# Build rules
all: $(TARGET)

$(TARGET): $(ASM_OBJECTS) $(CFG) $(CHR_FILE)
	@echo "$(COLOR_GREEN)Linking ROM...$(COLOR_RESET)"
	$(LD) $(LD_FLAGS) $(ASM_OBJECTS) -o $(TARGET)
	@echo "$(COLOR_GREEN)ROM built: $(TARGET)$(COLOR_RESET)"
	@ls -lh $(TARGET)

$(BUILD_DIR)/%.o: $(SRC_DIR)/%.asm
	@mkdir -p $(BUILD_DIR)
	@echo "$(COLOR_GREEN)Assembling $<...$(COLOR_RESET)"
	$(AS) $(AS_FLAGS) $< -o $@

clean:
	@echo "$(COLOR_BLUE)Cleaning build artifacts...$(COLOR_RESET)"
	@rm -rf $(BUILD_DIR)/*.o $(BUILD_DIR)/*.nes $(BUILD_DIR)/*.map
	@echo "$(COLOR_GREEN)Clean complete$(COLOR_RESET)"

run: $(TARGET)
	@echo "$(COLOR_BLUE)Launching $(EMU)...$(COLOR_RESET)"
	@if command -v $(EMU) >/dev/null 2>&1; then \
		$(EMU) $(TARGET); \
	else \
		echo "$(COLOR_YELLOW)Warning: $(EMU) not found. Please install FCEUX emulator.$(COLOR_RESET)"; \
		echo "$(COLOR_YELLOW)ROM is available at: $(TARGET)$(COLOR_RESET)"; \
	fi

# Alias for run
test: run

# Check build dependencies
check:
	@echo "$(COLOR_BLUE)Checking build dependencies...$(COLOR_RESET)"
	@command -v $(AS) >/dev/null 2>&1 && echo "$(COLOR_GREEN)✓ ca65 found$(COLOR_RESET)" || echo "$(COLOR_YELLOW)✗ ca65 not found - install cc65 toolchain$(COLOR_RESET)"
	@command -v $(LD) >/dev/null 2>&1 && echo "$(COLOR_GREEN)✓ ld65 found$(COLOR_RESET)" || echo "$(COLOR_YELLOW)✗ ld65 not found - install cc65 toolchain$(COLOR_RESET)"
	@command -v $(EMU) >/dev/null 2>&1 && echo "$(COLOR_GREEN)✓ fceux found$(COLOR_RESET)" || echo "$(COLOR_YELLOW)✗ fceux not found (optional)$(COLOR_RESET)"
	@test -f $(CHR_FILE) && echo "$(COLOR_GREEN)✓ CHR file exists$(COLOR_RESET)" || echo "$(COLOR_YELLOW)✗ CHR file missing at $(CHR_FILE)$(COLOR_RESET)"
	@test -f $(CFG) && echo "$(COLOR_GREEN)✓ nes.cfg exists$(COLOR_RESET)" || echo "$(COLOR_YELLOW)✗ nes.cfg missing$(COLOR_RESET)"

# Show project info
info:
	@echo "$(COLOR_BLUE)MITOSIS PANIC Build System$(COLOR_RESET)"
	@echo "================================"
	@echo "Project: MITOSIS PANIC NES ROM"
	@echo "ROM Output: $(TARGET)"
	@echo "Source Files: $(ASM_SOURCES)"
	@echo "CHR File: $(CHR_FILE)"
	@echo ""
	@echo "Targets:"
	@echo "  make         - Build the ROM"
	@echo "  make run     - Build and run in FCEUX"
	@echo "  make test    - Alias for 'make run'"
	@echo "  make clean   - Remove build artifacts"
	@echo "  make check   - Check build dependencies"
	@echo "  make info    - Show this information"

# Help alias
help: info

.PHONY: all clean run test check info help
