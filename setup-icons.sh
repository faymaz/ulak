#!/bin/bash

# setup-icons.sh - Setup icons for Ulak extension

ICON_DIR="icons"

echo "Setting up Ulak extension icons..."

# Create icons directory if it doesn't exist
if [ ! -d "$ICON_DIR" ]; then
    mkdir -p "$ICON_DIR"
    echo "Created $ICON_DIR directory"
fi

# Check if icon files exist
if [ -f "$ICON_DIR/ulak.png" ]; then
    echo "✓ ulak.png found"
else
    echo "⚠ ulak.png not found in $ICON_DIR/"
    echo "Please add ulak.png to the $ICON_DIR/ directory"
fi

if [ -f "$ICON_DIR/ulak.jpg" ]; then
    echo "✓ ulak.jpg found"
else
    echo "⚠ ulak.jpg not found in $ICON_DIR/"
    echo "Please add ulak.jpg to the $ICON_DIR/ directory"
fi

# Create a simple SVG icon as fallback if no icons exist
if [ ! -f "$ICON_DIR/ulak.png" ] && [ ! -f "$ICON_DIR/ulak.jpg" ]; then
    echo "Creating fallback SVG icon..."
    cat > "$ICON_DIR/ulak-symbolic.svg" << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<svg width="16" height="16" version="1.1" xmlns="http://www.w3.org/2000/svg">
  <g fill="#000000">
    <path d="M8 1C4.134 1 1 4.134 1 8s3.134 7 7 7 7-3.134 7-7-3.134-7-7-7zm0 2c2.761 0 5 2.239 5 5s-2.239 5-5 5-5-2.239-5-5 2.239-5 5-5z"/>
    <path d="M8 5L5 9h2v2h2V9h2L8 5z"/>
  </g>
</svg>
EOF
    echo "Created fallback ulak-symbolic.svg"
fi

# Set proper permissions
chmod 644 "$ICON_DIR"/* 2>/dev/null

echo ""
echo "Icon setup complete!"
echo ""
echo "Current icons in $ICON_DIR/:"
ls -la "$ICON_DIR/" 2>/dev/null || echo "No icons directory found"
echo ""
echo "Note: For best results, add your custom ulak.png or ulak.jpg"
echo "      to the $ICON_DIR/ directory before installation."