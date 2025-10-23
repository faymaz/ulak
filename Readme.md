![Visitor Count](https://visitor-badge.laobi.icu/badge?page_id=faymaz.ulak)

# Ulak - GNOME Shell Video Downloader

A GNOME Shell extension that allows you to easily download videos from YouTube and Patreon.

## 🎯 Features

- ✅ YouTube video download
- ✅ Patreon video download (with cookies support)
- ✅ Video quality selection (360p - 4K + audio only)
- ✅ Customizable download directory
- ✅ Concurrent multiple downloads
- ✅ Download progress display
- ✅ Notification support
- ✅ Download history
- ✅ Easy-to-use panel menu

## 📋 Requirements

- GNOME Shell 45, 46, 47, or 48
- yt-dlp
- ffmpeg (for video merging)
- Python 3.8+

## 🚀 Installation

### Automatic Installation (with Makefile)

```bash
# Clone the repository
git clone https://github.com/faymaz/ulak.git
cd ulak

# Check dependencies
make check-deps

# Install and enable the extension
make install
make enable

# Restart GNOME Shell
# Press Alt+F2, type 'r' and press Enter
```

### Manual Installation

1. **Install yt-dlp:**
```bash
# Using pip
pip install --user yt-dlp (pip install -U yt-dlp)

# Or using apt (Ubuntu/Debian)
sudo apt install yt-dlp

# Or using snap
sudo snap install yt-dlp
```
### Important Notice
To ensure proper functionality, you must install the latest version of the software. Package managers like `apt` or `snap` may not provide the most up-to-date version.

2. **Install ffmpeg:**
```bash
sudo apt install ffmpeg
```

3. **Install the extension:**
```bash
# Create extension directory
mkdir -p ~/.local/share/gnome-shell/extensions/ulak@faymaz.github.com

# Copy all files
cp -r * ~/.local/share/gnome-shell/extensions/ulak@faymaz.github.com/

# Compile schemas
cd ~/.local/share/gnome-shell/extensions/ulak@faymaz.github.com/schemas
glib-compile-schemas .

# Enable the extension
gnome-extensions enable ulak@faymaz.github.com
```

4. **Restart GNOME Shell:**
   - Press Alt+F2
   - Type 'r' and press Enter
   - Or logout and login again

## 🎮 Usage

1. **Basic Usage:**
   - Click on the Ulak icon in the top panel
   - Paste the video URL
   - Select video quality
   - Click "Download"

2. **Settings:**
   - Change download directory
   - Default video quality
   - Concurrent downloads count
   - Notification settings
   - yt-dlp path configuration

## 🛠️ Commands

```bash
# Installation
make install       # Install the extension
make uninstall     # Uninstall the extension

# Control
make enable        # Enable the extension
make disable       # Disable the extension
make status        # Show status

# Development
make dev          # Developer mode
make logs         # Show logs
make test         # Run tests

# Packaging
make package      # Create ZIP package
make clean        # Clean temporary files
```

## 🔧 Troubleshooting

### yt-dlp not found error:
```bash
# Update yt-dlp
pip install --upgrade yt-dlp

# Add to PATH
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

### Video merge error:
```bash
# Check ffmpeg installation
ffmpeg -version

# If not installed
sudo apt install ffmpeg
```

### Extension not appearing:
```bash
# Check status
gnome-extensions info ulak@faymaz.github.com

# Check logs
journalctl -f -o cat /usr/bin/gnome-shell | grep -i ulak
```

### Patreon videos not downloading:
1. Install "cookies.txt" browser extension
2. Login to Patreon
3. Export cookies
4. Select cookies file in Ulak settings

## 🍪 Patreon Video Downloads

Patreon videos require authentication via cookies. Here's how to set it up:

### Quick Setup (Browser Extension Method):

#### Firefox:
1. Install [cookies.txt extension](https://addons.mozilla.org/en-US/firefox/addon/cookies-txt/)
2. Login to Patreon.com
3. Click extension icon → "Current Site" → Export
4. Save as `patreon-cookies.txt`

#### Chrome/Edge:
1. Install [Get cookies.txt LOCALLY](https://chrome.google.com/webstore/detail/get-cookiestxt-locally/cclelndahbckbenkjhflpdbgdldlbecc)
2. Login to Patreon.com
3. Click extension icon → Export
4. Save as `patreon-cookies.txt`

### Alternative Method (Command Line):
```bash
# Firefox
yt-dlp --cookies-from-browser firefox --cookies ~/patreon-cookies.txt --skip-download "https://youtube.com"

# Chrome
yt-dlp --cookies-from-browser chrome --cookies ~/patreon-cookies.txt --skip-download "https://youtube.com"
```

### Configure Ulak:
1. Click Ulak icon → Settings
2. Advanced Settings → Cookies File
3. Choose your `patreon-cookies.txt` file
4. Now you can download Patreon videos!

### Test Your Setup:
```bash
# Check if cookies file exists
ls -la ~/patreon-cookies.txt

# Check for Patreon cookies
grep "patreon" ~/patreon-cookies.txt

# Test download
yt-dlp --cookies ~/patreon-cookies.txt "PATREON_URL"
```

### Important Notes:
- **You must be a patron** of the creator to download their content
- **Cookies expire** every 1-3 months - re-export when needed
- **Keep cookies file private** - it contains your login session
- **One cookies file** works for all creators you support
- **Test with a free/public post first** to verify setup

## 🎨 Customization

### Video Quality Formats:
- `2160p` - 4K Ultra HD
- `1440p` - 2K Quad HD
- `1080p` - Full HD (default)
- `720p` - HD
- `480p` - SD
- `360p` - Low quality
- `audio` - Audio only (MP3)

### Filename Format:
Configurable in settings. Default:
```
%(title)s-%(resolution)s.%(ext)s
```

Other options:
- `%(title)s.%(ext)s` - Title only
- `%(upload_date)s-%(title)s.%(ext)s` - With date
- `%(uploader)s/%(title)s.%(ext)s` - In channel folder

## 📝 License

MIT License

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🐛 Bug Reports

For bugs and suggestions, please use the [GitHub Issues](https://github.com/faymaz/ulak/issues) page.

## 💝 Support

If you like this project, please give it a ⭐!

Support via [GitHub Sponsors](https://github.com/sponsors/faymaz)

## 📧 Contact

- GitHub: [@faymaz](https://github.com/faymaz)
- Email: faymaz@github.com

Make sure these icon files exist in the `icons/` directory for the extension to display properly.

---

**Note:** This extension is for educational purposes. Compliance with copyright laws is the user's responsibility.
