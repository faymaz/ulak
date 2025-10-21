#!/bin/bash

# extract-cookies.sh - Extract cookies from browser for Patreon

echo "==================================="
echo "Patreon Cookies Extractor for Ulak"
echo "==================================="
echo ""

# Function to extract cookies
extract_cookies() {
    local browser=$1
    local output_file=$2
    
    echo "Extracting cookies from $browser..."
    
    # Extract cookies without trying to download anything
    yt-dlp --cookies-from-browser $browser --cookies "$output_file" --skip-download --no-warnings "https://www.youtube.com" 2>/dev/null
    
    if [ $? -eq 0 ] && [ -f "$output_file" ]; then
        echo "✅ Successfully extracted cookies to: $output_file"
        
        # Check if Patreon cookies exist
        if grep -q "patreon.com" "$output_file"; then
            echo "✅ Found Patreon cookies in the file!"
            return 0
        else
            echo "⚠️ No Patreon cookies found. Make sure you're logged in to Patreon in $browser"
            return 1
        fi
    else
        echo "❌ Failed to extract cookies from $browser"
        return 1
    fi
}

# Menu
echo "Select your browser:"
echo "1) Firefox"
echo "2) Chrome"
echo "3) Chromium"
echo "4) Brave"
echo "5) Edge"
echo "6) Opera"
echo "7) Vivaldi"
echo ""
read -p "Choice [1-7]: " choice

# Set browser name
case $choice in
    1) BROWSER="firefox" ;;
    2) BROWSER="chrome" ;;
    3) BROWSER="chromium" ;;
    4) BROWSER="brave" ;;
    5) BROWSER="edge" ;;
    6) BROWSER="opera" ;;
    7) BROWSER="vivaldi" ;;
    *) echo "Invalid choice!"; exit 1 ;;
esac

# Output file
OUTPUT_FILE="$HOME/patreon-cookies.txt"

echo ""
echo "Selected browser: $BROWSER"
echo "Output file: $OUTPUT_FILE"
echo ""

# Check if logged in to Patreon
echo "⚠️ IMPORTANT: Make sure you are:"
echo "   1. Logged in to Patreon.com in $BROWSER"
echo "   2. $BROWSER is closed (for some browsers)"
echo ""
read -p "Press Enter to continue..."

# Extract cookies
extract_cookies "$BROWSER" "$OUTPUT_FILE"

if [ $? -eq 0 ]; then
    echo ""
    echo "==================================="
    echo "✅ Success!"
    echo ""
    echo "Cookies file saved to: $OUTPUT_FILE"
    echo ""
    echo "To use in Ulak:"
    echo "1. Click Ulak icon in panel → Settings"
    echo "2. Go to 'Advanced Settings'"
    echo "3. Click 'Choose File' next to 'Cookies File'"
    echo "4. Select: $OUTPUT_FILE"
    echo ""
    echo "To test manually:"
    echo "yt-dlp --cookies \"$OUTPUT_FILE\" \"[PATREON_URL]\""
    echo "==================================="
else
    echo ""
    echo "==================================="
    echo "❌ Cookie extraction failed or incomplete"
    echo ""
    echo "Alternative method - Manual extraction:"
    echo ""
    echo "1. Install browser extension:"
    echo "   Firefox: 'cookies.txt' addon"
    echo "   Chrome: 'Get cookies.txt LOCALLY'"
    echo ""
    echo "2. Go to patreon.com and login"
    echo ""
    echo "3. Click extension icon → Export"
    echo ""
    echo "4. Save as: $OUTPUT_FILE"
    echo "==================================="
fi