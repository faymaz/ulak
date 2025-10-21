#!/bin/bash

# test-patreon.sh - Test Patreon download with cookies

echo "==================================="
echo "Ulak Patreon Download Tester"
echo "==================================="
echo ""

# Check if yt-dlp is installed
if ! command -v yt-dlp &> /dev/null; then
    echo "❌ yt-dlp is not installed!"
    echo "Install with: pip install yt-dlp"
    exit 1
fi

echo "✅ yt-dlp found: $(yt-dlp --version)"
echo ""

# Get Patreon URL
read -p "Enter Patreon video URL: " PATREON_URL

if [[ ! "$PATREON_URL" =~ patreon\.com ]]; then
    echo "❌ This doesn't look like a Patreon URL"
    exit 1
fi

# Get cookies file
echo ""
echo "Select cookies file location:"
echo "1) ~/Downloads/patreon-cookies.txt"
echo "2) ~/cookies.txt"
echo "3) Custom location"
echo "4) Extract from Firefox"
echo "5) Extract from Chrome"

read -p "Choice [1-5]: " CHOICE

case $CHOICE in
    1)
        COOKIES_FILE="$HOME/Downloads/patreon-cookies.txt"
        ;;
    2)
        COOKIES_FILE="$HOME/cookies.txt"
        ;;
    3)
        read -p "Enter cookies file path: " COOKIES_FILE
        # Expand tilde if present
        COOKIES_FILE="${COOKIES_FILE/#\~/$HOME}"
        ;;
    4)
        echo "Extracting cookies from Firefox..."
        COOKIES_FILE="$HOME/patreon-cookies-firefox.txt"
        yt-dlp --cookies-from-browser firefox --cookies "$COOKIES_FILE" --skip-download "https://www.patreon.com"
        ;;
    5)
        echo "Extracting cookies from Chrome..."
        COOKIES_FILE="$HOME/patreon-cookies-chrome.txt"
        yt-dlp --cookies-from-browser chrome --cookies "$COOKIES_FILE" --skip-download "https://www.patreon.com"
        ;;
    *)
        echo "Invalid choice"
        exit 1
        ;;
esac

# Check if cookies file exists
if [ ! -f "$COOKIES_FILE" ]; then
    echo ""
    echo "❌ Cookies file not found: $COOKIES_FILE"
    echo ""
    echo "To create a cookies file:"
    echo "1. Install 'cookies.txt' browser extension"
    echo "2. Log in to Patreon"
    echo "3. Click the extension and export cookies"
    echo "4. Save as patreon-cookies.txt"
    exit 1
fi

echo ""
echo "✅ Found cookies file: $COOKIES_FILE"
echo ""

# Test download
echo "Testing download..."
echo "Command: yt-dlp --cookies \"$COOKIES_FILE\" -f \"best\" \"$PATREON_URL\""
echo ""

yt-dlp \
    --cookies "$COOKIES_FILE" \
    --verbose \
    -f "best" \
    --merge-output-format mp4 \
    -o "~/Downloads/%(title)s.%(ext)s" \
    "$PATREON_URL"

EXIT_CODE=$?

echo ""
if [ $EXIT_CODE -eq 0 ]; then
    echo "✅ Download successful!"
    echo ""
    echo "To use this cookies file in Ulak:"
    echo "1. Open Ulak settings (panel icon → Settings)"
    echo "2. Go to Advanced Settings"
    echo "3. Select this cookies file: $COOKIES_FILE"
else
    echo "❌ Download failed!"
    echo ""
    echo "Common issues:"
    echo "- Not a patron of this creator"
    echo "- Cookies expired (re-export needed)"
    echo "- Wrong membership tier"
    echo "- Post is not available to your tier"
fi

echo ""
echo "==================================="