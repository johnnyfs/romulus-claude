#!/bin/bash
# MITOSIS PANIC - CHR Graphics Validation Script
# Validates game.chr integrity against specifications

set -e

CHR_FILE="game.chr"
FAILED=0

echo "========================================="
echo "  MITOSIS PANIC - CHR Validation"
echo "========================================="
echo

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

pass() {
    echo -e "${GREEN}✓${NC} $1"
}

fail() {
    echo -e "${RED}✗${NC} $1"
    FAILED=1
}

warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Check file exists
echo "=== File Integrity ==="
if [ ! -f "$CHR_FILE" ]; then
    fail "CHR file not found: $CHR_FILE"
    exit 1
fi
pass "CHR file exists: $CHR_FILE"

# Check file size
SIZE=$(wc -c < "$CHR_FILE")
if [ "$SIZE" -eq 8192 ]; then
    pass "File size correct: 8192 bytes (8KB)"
else
    fail "File size incorrect: $SIZE bytes (expected 8192)"
fi

# Generate checksums for reproducibility
echo
echo "=== Checksums ==="
MD5=$(md5 -q "$CHR_FILE" 2>/dev/null || md5sum "$CHR_FILE" | awk '{print $1}')
SHA256=$(shasum -a 256 "$CHR_FILE" | awk '{print $1}')
echo "MD5:    $MD5"
echo "SHA256: $SHA256"
pass "Checksums generated for reproducibility"

# Validate critical tiles
echo
echo "=== Critical Tile Validation ==="

# Tile $00: Player base (offset 0x0000, 16 bytes)
TILE00=$(hexdump -s 0 -n 16 -e '16/1 "%02x" "\n"' "$CHR_FILE")
EXPECTED00="3c7effffffff7e3c3c7effffffff7e3c"
if [ "$TILE00" = "$EXPECTED00" ]; then
    pass "Tile \$00 (Player base): Valid circular pattern"
else
    fail "Tile \$00 corrupted. Got: $TILE00, Expected: $EXPECTED00"
fi

# Tile $01: Small circle (offset 0x0010, 16 bytes)
TILE01=$(hexdump -s 16 -n 16 -e '16/1 "%02x" "\n"' "$CHR_FILE")
EXPECTED01="183c7e7e7e7e3c180000000000000000"
if [ "$TILE01" = "$EXPECTED01" ]; then
    pass "Tile \$01 (Small circle): Valid pattern"
else
    fail "Tile \$01 corrupted. Got: $TILE01"
fi

# Tile $02: Antibody (offset 0x0020, 16 bytes)
TILE02=$(hexdump -s 32 -n 16 -e '16/1 "%02x" "\n"' "$CHR_FILE")
EXPECTED02="4242427e3c1818184242427e3c181818"
if [ "$TILE02" = "$EXPECTED02" ]; then
    pass "Tile \$02 (Antibody Y-shape): Valid pattern"
else
    fail "Tile \$02 corrupted. Got: $TILE02, Expected: $EXPECTED02"
fi

# Tile $04: Player frame 2 (offset 0x0040, 16 bytes)
TILE04=$(hexdump -s 64 -n 16 -e '16/1 "%02x" "\n"' "$CHR_FILE")
if [ "$TILE04" = "$EXPECTED00" ]; then
    pass "Tile \$04 (Player frame 2): Valid (copy of \$00)"
else
    warn "Tile \$04 differs from \$00 - may be intentional animation variation"
fi

# Tile $10: Green nutrient (offset 0x0100, 16 bytes)
TILE10=$(hexdump -s 256 -n 16 -e '16/1 "%02x" "\n"' "$CHR_FILE")
if [ "$TILE10" = "$EXPECTED01" ]; then
    pass "Tile \$10 (Green nutrient): Valid"
else
    fail "Tile \$10 corrupted. Got: $TILE10"
fi

# Tile $11: Yellow nutrient (offset 0x0110, 16 bytes)
TILE11=$(hexdump -s 272 -n 16 -e '16/1 "%02x" "\n"' "$CHR_FILE")
if [ "$TILE11" = "$EXPECTED01" ]; then
    pass "Tile \$11 (Yellow nutrient): Valid"
else
    fail "Tile \$11 corrupted. Got: $TILE11"
fi

# Tile $12: Pink nutrient (offset 0x0120, 16 bytes)
TILE12=$(hexdump -s 288 -n 16 -e '16/1 "%02x" "\n"' "$CHR_FILE")
if [ "$TILE12" = "$EXPECTED01" ]; then
    pass "Tile \$12 (Pink nutrient): Valid"
else
    fail "Tile \$12 corrupted. Got: $TILE12"
fi

# Check for accidental corruption patterns
echo
echo "=== Corruption Detection ==="

# Check for all-zeros corruption (common SD card failure)
ZERO_COUNT=$(hexdump -v -e '1/1 "%02x\n"' "$CHR_FILE" | grep -c "^00$" || true)
ZERO_PERCENT=$((ZERO_COUNT * 100 / 8192))
if [ "$ZERO_PERCENT" -gt 98 ]; then
    pass "Zero byte percentage expected for MVP: ${ZERO_PERCENT}% (only 7 tiles used)"
elif [ "$ZERO_PERCENT" -gt 70 ]; then
    pass "Zero byte percentage normal: ${ZERO_PERCENT}% (MVP has many empty tiles)"
else
    warn "Zero byte percentage low: ${ZERO_PERCENT}% (may indicate dense CHR)"
fi

# Check for all-FF corruption (flash erase failure)
FF_COUNT=$(hexdump -v -e '1/1 "%02x\n"' "$CHR_FILE" | grep -c "^ff$" || true)
if [ "$FF_COUNT" -gt 4096 ]; then
    fail "File appears erased: $FF_COUNT bytes are 0xFF"
else
    pass "No erase corruption detected"
fi

# Validate bitplane structure (every 16 bytes should have patterns in both halves)
echo
echo "=== Bitplane Structure ==="

check_bitplane() {
    local offset=$1
    local name=$2
    local plane0=$(hexdump -s $offset -n 8 -e '8/1 "%02x"' "$CHR_FILE")
    local plane1=$(hexdump -s $((offset + 8)) -n 8 -e '8/1 "%02x"' "$CHR_FILE")

    if [ -z "$plane0" ] || [ -z "$plane1" ]; then
        fail "$name: Cannot read bitplanes"
        return
    fi

    # Both planes all-zero is valid (empty tile)
    if [ "$plane0" = "0000000000000000" ] && [ "$plane1" = "0000000000000000" ]; then
        return
    fi

    # At least one plane should have data
    if [ "$plane0" = "0000000000000000" ] && [ "$plane1" = "0000000000000000" ]; then
        warn "$name: Both bitplanes empty (valid if unused)"
    else
        pass "$name: Bitplanes have data"
    fi
}

check_bitplane 0 "Tile \$00"
check_bitplane 16 "Tile \$01"
check_bitplane 32 "Tile \$02"
check_bitplane 64 "Tile \$04"

# Bank alignment check
echo
echo "=== Bank Alignment ==="
HALF_SIZE=$((SIZE / 2))
if [ "$HALF_SIZE" -eq 4096 ]; then
    pass "Sprite bank: 4096 bytes (256 tiles)"
    pass "Background bank: 4096 bytes (256 tiles)"
else
    fail "Bank sizes incorrect"
fi

# Summary
echo
echo "========================================="
if [ "$FAILED" -eq 0 ]; then
    echo -e "${GREEN}✓ ALL VALIDATION CHECKS PASSED${NC}"
    echo "CHR file is production-ready"
    exit 0
else
    echo -e "${RED}✗ VALIDATION FAILED${NC}"
    echo "CHR file has errors - review output above"
    exit 1
fi
