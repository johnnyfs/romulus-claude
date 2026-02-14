# Makefile for MITOSIS PANIC NES ROM

# Tools
AS = ca65
LD = ld65
EMU = fceux

# Directories
SRC_DIR = src
BUILD_DIR = build
TEMPLATES_DIR = .

# Files
TARGET = $(BUILD_DIR)/mitosis_panic.nes
ASM_SRC = $(SRC_DIR)/main.asm
CFG = nes.cfg

# Build rules
all: $(TARGET)

$(TARGET): $(ASM_SRC) $(CFG)
	@mkdir -p $(BUILD_DIR)
	$(AS) $(ASM_SRC) -o $(BUILD_DIR)/main.o
	$(LD) -C $(CFG) $(BUILD_DIR)/main.o -o $(TARGET)
	@echo "ROM built: $(TARGET)"

clean:
	rm -rf $(BUILD_DIR)/*.o $(BUILD_DIR)/*.nes

run: $(TARGET)
	$(EMU) $(TARGET)

.PHONY: all clean run
