![Visitor Count](https://visitor-badge.laobi.icu/badge?page_id=faymaz.ulak)

# Ulak - GNOME Shell Video Downloader

A GNOME Shell extension for downloading videos from YouTube and Patreon directly from your desktop panel.

## Features

- Download YouTube videos in various qualities (360p to 4K)
- Download Patreon videos (with authentication)
- Audio-only extraction (MP3 format)
- Real-time download progress tracking
- Download history with quick file access
- Multiple quality presets
- Custom download directory
- Configurable yt-dlp path
- Clean, integrated panel interface

## Requirements

### Essential Dependencies

- **GNOME Shell:** 45, 46, 47, 48, or 49
- **yt-dlp:** Video downloader (see installation below)
- **ffmpeg:** Video/audio processing

### yt-dlp Installation

yt-dlp is the core dependency for video downloads. Choose one of the following methods:

#### Method 1: pip (Recommended)
```bash
pip install -U yt-dlp
```

**Why pip is recommended:**
- Always provides the latest version
- Essential for avoiding HTTP 403 errors
- Updates weekly with platform fixes
- No root/sudo required for user installation

**Current version:** yt-dlp 2025.12.08 (updates frequently)

#### Method 2: System Package Manager
```bash
# Debian/Ubuntu
sudo apt install yt-dlp

# Fedora
sudo dnf install yt-dlp
```

**Note:** System packages may lag behind pip versions. If you encounter download errors (especially 403 Forbidden), update via pip.

#### Method 3: Portable Binary
```bash
sudo wget https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -O /usr/local/bin/yt-dlp
sudo chmod a+rx /usr/local/bin/yt-dlp
```

### ffmpeg Installation
```bash
sudo apt install ffmpeg  # Debian/Ubuntu
sudo dnf install ffmpeg  # Fedora
```

## Installation

### From GNOME Extensions Website (Recommended)

1. Visit [extensions.gnome.org](https://extensions.gnome.org/)
2. Search for "Ulak"
3. Click the install button
4. Install yt-dlp and ffmpeg (see Requirements section above)

### Manual Installation from Source

1. **Install dependencies:**
```bash
# Install yt-dlp (recommended method)
pip install -U yt-dlp

# Install ffmpeg
sudo apt install ffmpeg  # Debian/Ubuntu
```

2. **Clone and install extension:**
```bash
git clone https://github.com/faymaz/ulak.git
cd ulak

# Create extension directory
mkdir -p ~/.local/share/gnome-shell/extensions/ulak@faymaz.github.com

# Copy files
cp -r extension.js prefs.js metadata.json icons schemas \
  ~/.local/share/gnome-shell/extensions/ulak@faymaz.github.com/

# Compile GSettings schema
cd ~/.local/share/gnome-shell/extensions/ulak@faymaz.github.com/schemas
glib-compile-schemas .
cd ..

# Enable the extension
gnome-extensions enable ulak@faymaz.github.com
```

3. **Restart GNOME Shell:**
   - **X11:** Press `Alt+F2`, type `r`, press Enter
   - **Wayland:** Log out and log back in

## Usage

### Basic Download Workflow

1. **Click** the Ulak icon in the top panel
2. **Paste** a YouTube or Patreon video URL
3. **Select** desired video quality (360p to 4K, or audio-only)
4. **Click** Download button
5. **Monitor** progress in real-time
6. **Access** downloaded files from history or download folder

### Available Quality Options

- `2160p` - 4K Ultra HD
- `1440p` - 2K Quad HD
- `1080p` - Full HD
- `720p` - HD (recommended for balance)
- `480p` - Standard Definition
- `360p` - Low quality (smallest file size)
- `audio` - Audio only (MP3, highest quality)

### Settings Configuration

Access settings by clicking the gear icon in the menu:

- **Download Directory:** Choose where files are saved
- **Default Quality:** Set preferred quality for all downloads
- **Concurrent Downloads:** Maximum simultaneous downloads (1-5)
- **yt-dlp Path:** Custom path if not in system PATH
- **Cookies File:** Required for Patreon downloads
- **Notifications:** Toggle completion notifications
- **Download History:** Enable/disable history tracking

## Troubleshooting

### "yt-dlp not found" Error

The extension cannot locate yt-dlp on your system.

**Solution 1: Install yt-dlp**
```bash
pip install -U yt-dlp
```

**Solution 2: Add to PATH**
```bash
# Add pip bin directory to PATH
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# Verify installation
which yt-dlp
yt-dlp --version
```

**Solution 3: Specify Custom Path**
1. Find yt-dlp location: `which yt-dlp`
2. Open Ulak settings
3. Enter full path in "yt-dlp Path" field

### HTTP 403 Forbidden Errors

YouTube frequently changes their API, causing download failures.

**Solution:**
```bash
# Update yt-dlp to latest version
pip install -U yt-dlp

# Verify version (should be recent)
yt-dlp --version
```

**Note:** yt-dlp is updated weekly to fix these issues. Always keep it current.

### Extension Not Appearing in Panel

**Check extension status:**
```bash
gnome-extensions info ulak@faymaz.github.com
```

**View error logs:**
```bash
journalctl -f -o cat /usr/bin/gnome-shell | grep -i ulak
```

**Reinstall schema:**
```bash
cd ~/.local/share/gnome-shell/extensions/ulak@faymaz.github.com/schemas
glib-compile-schemas .
gnome-extensions disable ulak@faymaz.github.com
gnome-extensions enable ulak@faymaz.github.com
```

### Video/Audio Merge Errors

**Check ffmpeg:**
```bash
ffmpeg -version
```

**Install if missing:**
```bash
sudo apt install ffmpeg
```

## Patreon Video Downloads

Patreon videos require authentication. You must export browser cookies to download content from creators you support.

### Prerequisites

- Active Patreon account
- Subscription/patronage to the creator whose content you want to download
- Browser extension for exporting cookies

### Step 1: Export Browser Cookies

#### Firefox Users

1. Install [cookies.txt extension](https://addons.mozilla.org/en-US/firefox/addon/cookies-txt/)
2. Navigate to patreon.com and log in
3. Click the extension icon
4. Select "Current Site"
5. Click "Export" and save as `patreon-cookies.txt`

#### Chrome/Chromium/Edge Users

1. Install [Get cookies.txt LOCALLY](https://chrome.google.com/webstore/detail/get-cookiestxt-locally/cclelndahbckbenkjhflpdbgdldlbecc)
2. Navigate to patreon.com and log in
3. Click the extension icon
4. Click "Export" and save as `patreon-cookies.txt`

#### Command Line Alternative

```bash
# Extract cookies directly from browser database
# Firefox
yt-dlp --cookies-from-browser firefox --cookies ~/patreon-cookies.txt --skip-download "https://youtube.com"

# Chrome
yt-dlp --cookies-from-browser chrome --cookies ~/patreon-cookies.txt --skip-download "https://youtube.com"
```

### Step 2: Configure Ulak

1. Click the Ulak icon in the panel
2. Select **Settings** (gear icon)
3. Scroll to **Advanced Settings**
4. Click **Cookies File** → **Choose File**
5. Select your `patreon-cookies.txt` file
6. Click **Select**

### Step 3: Download Patreon Videos

1. Copy the Patreon post URL containing the video
2. Paste into Ulak's URL field
3. Select desired quality
4. Click Download

### Verification

Test your setup before attempting downloads:

```bash
# Verify cookies file exists
ls -la ~/patreon-cookies.txt

# Verify Patreon cookies are present
grep "patreon.com" ~/patreon-cookies.txt

# Test download from command line
yt-dlp --cookies ~/patreon-cookies.txt "YOUR_PATREON_POST_URL"
```

### Important Security Notes

- Cookies contain your **login session** - treat them like passwords
- Store cookies file in a **secure location** (e.g., `~/.config/`)
- **Never share** your cookies file
- Cookies **expire** after 1-3 months - re-export when needed
- One cookies file works for **all creators** you support

### Troubleshooting Patreon Downloads

**"Login required" or "Access denied" errors:**
- Re-export fresh cookies from your browser
- Verify you're logged into Patreon in the browser
- Confirm you have active patronage to the creator

**Video not downloading:**
- Some Patreon videos are YouTube embeds (these don't require cookies)
- Verify the post actually contains a downloadable video
- Check Ulak logs for detailed error messages

## Advanced Configuration

### Custom yt-dlp Path

If yt-dlp is installed in a non-standard location:

1. Find the installation path: `which yt-dlp`
2. Open Ulak Settings → Advanced Settings
3. Enter the full path in "yt-dlp Path" field
4. Save and test

### Download Directory

Change where videos are saved:

1. Open Ulak Settings
2. Click "Change Directory"
3. Select desired folder
4. New downloads will use this location

### Output Filename Format

The extension uses yt-dlp's default output template:
```
%(title)s.%(ext)s
```

To customize, modify `extension.js:221` before installation.

## Development

### Building from Source

```bash
git clone https://github.com/faymaz/ulak.git
cd ulak

# Install to local extensions directory
mkdir -p ~/.local/share/gnome-shell/extensions/ulak@faymaz.github.com
cp -r extension.js prefs.js metadata.json icons schemas \
  ~/.local/share/gnome-shell/extensions/ulak@faymaz.github.com/

# Compile schemas
cd ~/.local/share/gnome-shell/extensions/ulak@faymaz.github.com/schemas
glib-compile-schemas .

# Enable and test
gnome-extensions enable ulak@faymaz.github.com
```

### Viewing Logs

Monitor extension activity:
```bash
journalctl -f -o cat /usr/bin/gnome-shell | grep -i ulak
```

### Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Test thoroughly on GNOME Shell 45+
5. Commit: `git commit -m 'Add amazing feature'`
6. Push: `git push origin feature/amazing-feature`
7. Open a Pull Request

Please ensure your code:
- Follows existing code style
- Includes error handling
- Cleans up resources in `disable()`
- Works on GNOME Shell 45-49

## License

MIT License - see LICENSE file for details

## Legal Notice

This extension is a graphical interface for yt-dlp. Users are responsible for:
- Complying with platform Terms of Service
- Respecting copyright and intellectual property rights
- Only downloading content they have rights to access
- Following applicable laws in their jurisdiction

The extension author assumes no liability for user actions.

## Support & Community

- **Bug Reports:** [GitHub Issues](https://github.com/faymaz/ulak/issues)
- **Feature Requests:** [GitHub Discussions](https://github.com/faymaz/ulak/discussions)
- **Source Code:** [GitHub Repository](https://github.com/faymaz/ulak)

If this extension is useful to you, please give it a star on GitHub!

## Acknowledgments

- Built with [yt-dlp](https://github.com/yt-dlp/yt-dlp)
- Powered by [GNOME Shell Extension APIs](https://gjs.guide/)
- Icons from GNOME icon theme

---

**Version:** 1.0
**Author:** [@faymaz](https://github.com/faymaz)
**GNOME Shell:** 45, 46, 47, 48, 49
