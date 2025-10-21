# How to Get Patreon Cookies for Ulak

Patreon videos require authentication via cookies. Here's how to export them:

## Method 1: Using Browser Extension (Recommended)

### For Firefox:
1. Install the **"cookies.txt"** extension:
   - https://addons.mozilla.org/en-US/firefox/addon/cookies-txt/

2. Log in to Patreon.com with your account

3. Click the extension icon and select "Current Site" or "All"

4. Save the file as `patreon-cookies.txt` in your Downloads folder

### For Chrome/Chromium:
1. Install the **"Get cookies.txt LOCALLY"** extension:
   - https://chrome.google.com/webstore/detail/get-cookiestxt-locally/cclelndahbckbenkjhflpdbgdldlbecc

2. Log in to Patreon.com with your account

3. Click the extension icon while on patreon.com

4. Click "Export" and save as `patreon-cookies.txt`

## Method 2: Using yt-dlp Browser Cookies (Alternative)

You can also extract cookies directly from your browser:

```bash
# For Firefox
yt-dlp --cookies-from-browser firefox --cookies cookies.txt --skip-download "https://www.patreon.com"

# For Chrome
yt-dlp --cookies-from-browser chrome --cookies cookies.txt --skip-download "https://www.patreon.com"

# For Chromium
yt-dlp --cookies-from-browser chromium --cookies cookies.txt --skip-download "https://www.patreon.com"
```

## Method 3: Manual Export (Advanced)

1. Open Patreon.com and log in
2. Open Developer Tools (F12)
3. Go to Network tab
4. Refresh the page
5. Find any request to patreon.com
6. Look at Request Headers → Cookie
7. Create a cookies.txt file in Netscape format

## Setting Cookies in Ulak

1. Open Ulak settings (click the panel icon → Settings)
2. Go to "Advanced Settings"
3. Click "Choose File" next to "Cookies File (for Patreon)"
4. Select your `patreon-cookies.txt` file
5. Now you can download Patreon videos!

## Testing Your Cookies

Test if your cookies work:

```bash
yt-dlp --cookies "~/Downloads/patreon-cookies.txt" "https://www.patreon.com/posts/[POST-ID]"
```

## Important Notes

- Cookies expire after some time (usually 30-90 days)
- You'll need to re-export cookies when they expire
- Keep your cookies file private - it contains your login session
- Make sure you're a patron of the creator whose content you're downloading

## Troubleshooting

### "You do not have access to this post" Error
- Make sure you're a patron of that creator
- Check if your membership tier has access to that post
- Verify your cookies are not expired

### Cookies File Not Working
1. Ensure you're logged in when exporting
2. Try using a different browser
3. Clear browser cache and re-login
4. Export cookies again

### File Format Issues
The cookies.txt file should look like this:
```
# Netscape HTTP Cookie File
.patreon.com	TRUE	/	TRUE	1234567890	session_id	abc123...
```

## Security Warning

⚠️ **Your cookies file contains your login session!**
- Don't share it with anyone
- Store it in a secure location
- Delete old cookies files after updating