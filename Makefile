# Makefile for Ulak GNOME Shell Extension

EXTENSION_UUID = ulak@faymaz.github.com
EXTENSION_DIR = $(HOME)/.local/share/gnome-shell/extensions/$(EXTENSION_UUID)
SCHEMA_DIR = $(EXTENSION_DIR)/schemas

# Files
JS_FILES = extension.js prefs.js
SCHEMA_FILES = schemas/org.gnome.shell.extensions.ulak.gschema.xml
OTHER_FILES = metadata.json stylesheet.css
# Note: Icons are expected to exist in icons/ directory
ICON_DIR = icons

# All files
ALL_FILES = $(JS_FILES) $(SCHEMA_FILES) $(OTHER_FILES)

# Default target
all: install

# Compile schemas
compile-schemas:
	@echo "Compiling schemas..."
	@mkdir -p schemas
	@glib-compile-schemas schemas/

# Install extension
install: compile-schemas
	@echo "Installing Ulak extension..."
	@mkdir -p $(EXTENSION_DIR)
	@mkdir -p $(SCHEMA_DIR)
	@mkdir -p $(EXTENSION_DIR)/icons
	
	@echo "Copying files..."
	@cp -f $(JS_FILES) $(EXTENSION_DIR)/
	@cp -f schemas/*.gschema.xml $(SCHEMA_DIR)/
	@cp -f schemas/gschemas.compiled $(SCHEMA_DIR)/
	@cp -f metadata.json $(EXTENSION_DIR)/
	@cp -f stylesheet.css $(EXTENSION_DIR)/
	@if [ -d "$(ICON_DIR)" ]; then \
		cp -rf $(ICON_DIR)/* $(EXTENSION_DIR)/icons/; \
	fi
	
	@echo "Installation complete!"
	@echo "To restart GNOME Shell: Alt+F2 -> 'r' -> Enter"
	@echo "Or logout and login again."

# Uninstall extension
uninstall:
	@echo "Uninstalling Ulak extension..."
	@rm -rf $(EXTENSION_DIR)
	@echo "Uninstall complete!"

# Clean temporary files
clean:
	@echo "Cleaning temporary files..."
	@rm -f schemas/gschemas.compiled
	@rm -f *.zip

# Create package
package: clean compile-schemas
	@echo "Creating ulak.zip package..."
	@mkdir -p build
	@cp -r $(JS_FILES) metadata.json stylesheet.css build/
	@mkdir -p build/schemas
	@cp -r schemas/* build/schemas/
	@if [ -d "$(ICON_DIR)" ]; then \
		mkdir -p build/icons; \
		cp -r $(ICON_DIR)/* build/icons/; \
	fi
	@cd build && zip -r ../ulak.zip .
	@rm -rf build
	@echo "ulak.zip created!"

# Enable extension
enable:
	@echo "Enabling Ulak extension..."
	@gnome-extensions enable $(EXTENSION_UUID)
	@echo "Extension enabled!"

# Disable extension
disable:
	@echo "Disabling Ulak extension..."
	@gnome-extensions disable $(EXTENSION_UUID)
	@echo "Extension disabled!"

# Check extension status
status:
	@echo "Ulak extension status:"
	@gnome-extensions info $(EXTENSION_UUID) 2>/dev/null || echo "Extension not installed"

# Show debug logs
logs:
	@echo "GNOME Shell logs (Ulak):"
	@journalctl -f -o cat /usr/bin/gnome-shell | grep -i ulak

# Check dependencies
check-deps:
	@echo "Checking dependencies..."
	@command -v yt-dlp >/dev/null 2>&1 && echo "✓ yt-dlp installed" || echo "✗ yt-dlp not installed. Install with: pip install yt-dlp"
	@command -v ffmpeg >/dev/null 2>&1 && echo "✓ ffmpeg installed" || echo "✗ ffmpeg not installed. Install with: sudo apt install ffmpeg"
	@echo ""
	@echo "yt-dlp version:"
	@yt-dlp --version 2>/dev/null || echo "yt-dlp not found"

# Developer mode - live reload
dev:
	@echo "Starting developer mode..."
	@make install
	@make enable
	@echo "Reload GNOME Shell to see changes (Alt+F2 -> 'r')"
	@make logs

# Test - simple checks
test:
	@echo "Running syntax checks..."
	@node -c extension.js 2>/dev/null && echo "✓ extension.js syntax OK" || echo "✗ extension.js has errors"
	@node -c prefs.js 2>/dev/null && echo "✓ prefs.js syntax OK" || echo "✗ prefs.js has errors"
	@xmllint --noout schemas/*.gschema.xml 2>/dev/null && echo "✓ Schema files OK" || echo "✗ Schema files have errors"

# Help
help:
	@echo "Ulak GNOME Shell Extension - Makefile Commands"
	@echo "=============================================="
	@echo "  make install     - Install the extension"
	@echo "  make uninstall   - Uninstall the extension"
	@echo "  make enable      - Enable the extension"
	@echo "  make disable     - Disable the extension"
	@echo "  make status      - Show extension status"
	@echo "  make package     - Create ZIP package"
	@echo "  make clean       - Clean temporary files"
	@echo "  make logs        - Show debug logs"
	@echo "  make check-deps  - Check dependencies"
	@echo "  make dev         - Start developer mode"
	@echo "  make test        - Run simple tests"
	@echo "  make help        - Show this help message"

.PHONY: all install uninstall clean package enable disable status logs check-deps dev test help compile-schemas