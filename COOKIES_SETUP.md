# 🍪 Patreon Cookies Setup for Ulak - Simple Guide

## Quick Method (Recommended) 

### For Firefox Users:

1. **Install Extension:**
   - Go to: https://addons.mozilla.org/en-US/firefox/addon/cookies-txt/
   - Click "Add to Firefox"

2. **Login to Patreon:**
   - Go to https://www.patreon.com
   - Login with your account

3. **Export Cookies:**
   - Click the cookies.txt extension icon (in toolbar)
   - Select "Current Site" or "patreon.com"
   - Click "Download" or "Export"
   - Save as `patreon-cookies.txt` in your home folder

4. **Configure Ulak:**
   - Click Ulak icon → Settings
   - Advanced Settings → Cookies File → Choose File
   - Select the `patreon-cookies.txt` file

### For Chrome/Edge Users:

1. **Install Extension:**
   - Go to: https://chrome.google.com/webstore/detail/get-cookiestxt-locally/cclelndahbckbenkjhflpdbgdldlbecc
   - Click "Add to Chrome"

2. **Login to Patreon:**
   - Go to https://www.patreon.com
   - Login with your account

3. **Export Cookies:**
   - Go to any Patreon post page
   - Click the "Get cookies.txt LOCALLY" extension icon
   - Click "Export" or "Download"
   - Save as `patreon-cookies.txt`

4. **Configure Ulak:**
   - Same as Firefox step 4

## Test Your Setup

```bash
# Test if cookies work
yt-dlp --cookies ~/patreon-cookies.txt "PATREON_POST_URL"
```

## Alternative: Direct Browser Extraction

If extensions don't work, try this script:

```bash
# Create the script
cat > ~/extract-cookies.sh << 'EOF'
#!/bin/bash
# For Firefox
yt-dlp --cookies-from-browser firefox --cookies ~/patreon-cookies.txt --skip-download --no-warnings "https://youtube.com"
grep -q "patreon" ~/patreon-cookies.txt && echo "✅ Cookies extracted!" || echo "❌ No Patreon cookies found"
EOF

# Run it
chmod +x ~/extract-cookies.sh
~/extract-cookies.sh
```

## ⚠️ Important Notes

1. **You must be a patron** of the creator to download their content
2. **Cookies expire** - You'll need to re-export every 1-3 months
3. **Keep cookies private** - They contain your login session
4. **One cookies file works for all Patreon creators** you support

## Troubleshooting

### "You do not have access to this post"
- ✅ Check: Are you a patron of this creator?
- ✅ Check: Does your tier have access to this post?
- ✅ Check: Are cookies expired? (re-export them)

### Cookies not working
- ✅ Make sure you're logged in when exporting
- ✅ Try closing and reopening browser
- ✅ Use the browser extension method (most reliable)

### Still having issues?
Test with a free/public Patreon post first to verify cookies are working.

## Working Example

Once configured correctly in Ulak:
1. Click Ulak icon in top panel
2. Paste Patreon URL
3. Select quality
4. Click Download
5. Video downloads to your configured folder!

---

💡 **Tip:** Save your cookies file in a consistent location like `~/Documents/patreon-cookies.txt` so you can easily find it when configuring Ulak.