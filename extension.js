// extension.js
import GObject from 'gi://GObject';
import St from 'gi://St';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Clutter from 'gi://Clutter';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';
import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';

const UlakIndicator = GObject.registerClass(
class UlakIndicator extends PanelMenu.Button {
    _init(extension) {
        super._init(0.0, 'Ulak Video Downloader');
        
        this._extension = extension;
        this._settings = extension.getSettings();
        this._downloads = [];
        
        // Panel icon - try to load custom icon first, fallback to system icon
        let iconPath = extension.path + '/icons/ulak.png';
        let iconFile = Gio.File.new_for_path(iconPath);
        
        let icon;
        if (iconFile.query_exists(null)) {
            icon = new St.Icon({
                gicon: Gio.icon_new_for_string(iconPath),
                style_class: 'system-status-icon',
            });
        } else {
            // Fallback to system icon if custom icon doesn't exist
            icon = new St.Icon({
                icon_name: 'folder-download-symbolic',
                style_class: 'system-status-icon',
            });
        }
        this.add_child(icon);
        
        // Build menu
        this._buildMenu();
        
        // Load settings
        this._loadSettings();
    }
    
    _buildMenu() {
        // URL entry field
        this._urlEntry = new St.Entry({
            style_class: 'ulak-url-entry',
            hint_text: 'Paste video URL here...',
            can_focus: true,
            x_expand: true,
        });
        
        let entryItem = new PopupMenu.PopupBaseMenuItem({
            reactive: false,
            can_focus: false,
        });
        entryItem.add_child(this._urlEntry);
        this.menu.addMenuItem(entryItem);
        
        // Quality selection
        this._qualitySection = new PopupMenu.PopupMenuSection();
        this.menu.addMenuItem(this._qualitySection);
        
        let qualityLabel = new PopupMenu.PopupMenuItem('Video Quality:', {
            reactive: false,
        });
        this._qualitySection.addMenuItem(qualityLabel);
        
        this._qualityOptions = ['2160p', '1440p', '1080p', '720p', '480p', '360p', 'audio'];
        this._selectedQuality = this._settings.get_string('default-quality');
        
        this._qualityMenuItems = {};
        for (let quality of this._qualityOptions) {
            let item = new PopupMenu.PopupMenuItem(quality);
            item.setOrnament(this._selectedQuality === quality ? 
                PopupMenu.Ornament.DOT : PopupMenu.Ornament.NONE);
            
            item.connect('activate', () => {
                this._selectQuality(quality);
            });
            
            this._qualityMenuItems[quality] = item;
            this._qualitySection.addMenuItem(item);
        }
        
        // Separator
        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
        
        // Download button
        this._downloadButton = new PopupMenu.PopupMenuItem('📥 Download');
        this._downloadButton.connect('activate', () => {
            this._startDownload();
        });
        this.menu.addMenuItem(this._downloadButton);
        
        // Download directory display
        let downloadDir = this._settings.get_string('download-directory');
        this._dirLabel = new PopupMenu.PopupMenuItem(
            '📁 Download Directory: ' + this._shortenPath(downloadDir),
            { reactive: false }
        );
        this.menu.addMenuItem(this._dirLabel);
        
        // Directory chooser
        let changeDirButton = new PopupMenu.PopupMenuItem('⚙️ Change Directory');
        changeDirButton.connect('activate', () => {
            this._openDirectoryChooser();
        });
        this.menu.addMenuItem(changeDirButton);
        
        // Separator
        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
        
        // Active downloads section
        this._downloadsSection = new PopupMenu.PopupMenuSection();
        this.menu.addMenuItem(this._downloadsSection);
        
        // Settings
        let settingsItem = new PopupMenu.PopupMenuItem('⚙️ Settings');
        settingsItem.connect('activate', () => {
            this._extension.openPreferences();
        });
        this.menu.addMenuItem(settingsItem);
    }
    
    _selectQuality(quality) {
        // Remove previous selection
        if (this._qualityMenuItems[this._selectedQuality]) {
            this._qualityMenuItems[this._selectedQuality].setOrnament(PopupMenu.Ornament.NONE);
        }
        
        // Mark new selection
        this._selectedQuality = quality;
        if (this._qualityMenuItems[quality]) {
            this._qualityMenuItems[quality].setOrnament(PopupMenu.Ornament.DOT);
        }
        
        // Save to settings
        this._settings.set_string('default-quality', quality);
    }
    
    _loadSettings() {
        this._downloadDir = this._settings.get_string('download-directory');
        if (this._downloadDir.startsWith('~')) {
            this._downloadDir = GLib.get_home_dir() + this._downloadDir.slice(1);
        }
        
        this._ytDlpPath = this._settings.get_string('yt-dlp-path');
        
        // Check yt-dlp availability
        this._checkYtDlp();
    }
    
    _checkYtDlp() {
        let ytDlpPath = this._ytDlpPath || 'yt-dlp';
        
        try {
            let [success, stdout, stderr, exitCode] = GLib.spawn_command_line_sync(
                `${ytDlpPath} --version`
            );
            
            if (success && exitCode === 0) {
                this._ytDlpAvailable = true;
            } else {
                this._ytDlpAvailable = false;
                this._showError('yt-dlp not found! Please install yt-dlp.');
            }
        } catch (e) {
            this._ytDlpAvailable = false;
            this._showError('yt-dlp not found! Please install yt-dlp.');
        }
    }
    
    _startDownload() {
        let url = this._urlEntry.get_text().trim();
        
        if (!url) {
            this._showError('Please enter a URL!');
            return;
        }
        
        if (!this._ytDlpAvailable) {
            this._showError('yt-dlp not found!');
            return;
        }
        
        // URL validation
        if (!this._isValidUrl(url)) {
            this._showError('Invalid URL!');
            return;
        }
        
        // Build download command
        let command = this._buildDownloadCommand(url);
        
        // Execute download
        this._executeDownload(command, url);
        
        // Clear URL field
        this._urlEntry.set_text('');
    }
    
    _isValidUrl(url) {
        // YouTube and Patreon URL validation
        const patterns = [
            /^https?:\/\/(www\.)?(youtube\.com|youtu\.be|patreon\.com)\/.+/i,
            /^https?:\/\/.*\.patreon\.com\/.+/i
        ];
        
        return patterns.some(pattern => pattern.test(url));
    }
    
    _buildDownloadCommand(url) {
        let ytDlpPath = this._ytDlpPath || 'yt-dlp';
        let outputPath = GLib.build_filenamev([
            this._downloadDir,
            '%(title)s-%(resolution)s.%(ext)s'
        ]);
        
        let command = [
            ytDlpPath,
            '--no-warnings',
            '--no-playlist',
            '--output', outputPath
        ];
        
        // Quality settings
        if (this._selectedQuality === 'audio') {
            command.push('-x');
            command.push('--audio-format', 'mp3');
            command.push('--audio-quality', '0');
        } else {
            command.push('-f');
            let formatString = `bestvideo[height<=${this._selectedQuality.replace('p', '')}]+bestaudio/best[height<=${this._selectedQuality.replace('p', '')}]`;
            command.push(formatString);
            command.push('--merge-output-format', 'mp4');
        }
        
        // Cookies support for Patreon
        let cookiesFile = this._settings.get_string('cookies-file');
        if (cookiesFile && url.includes('patreon.com')) {
            command.push('--cookies', cookiesFile);
        }
        
        command.push(url);
        
        return command.join(' ');
    }
    
    _executeDownload(command, url) {
        let downloadItem = new PopupMenu.PopupMenuItem('', {
            reactive: false,
        });
        
        let box = new St.BoxLayout({
            vertical: true,
            x_expand: true,
        });
        
        let titleLabel = new St.Label({
            text: 'Downloading: ' + this._shortenUrl(url),
            style_class: 'ulak-download-title',
        });
        
        let progressBar = new St.Widget({
            style_class: 'ulak-progress-bar',
            height: 4,
        });
        
        box.add_child(titleLabel);
        box.add_child(progressBar);
        downloadItem.add_child(box);
        
        this._downloadsSection.addMenuItem(downloadItem, 0);
        
        // Start download in background
        try {
            let proc = Gio.Subprocess.new(
                ['bash', '-c', command],
                Gio.SubprocessFlags.STDOUT_PIPE | Gio.SubprocessFlags.STDERR_PIPE
            );
            
            proc.communicate_utf8_async(null, null, (proc, res) => {
                try {
                    let [success, stdout, stderr] = proc.communicate_utf8_finish(res);
                    
                    if (proc.get_successful()) {
                        this._showSuccess('Download completed!');
                        titleLabel.set_text('✅ Completed: ' + this._shortenUrl(url));
                        
                        // Remove from list after 5 seconds
                        GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 5, () => {
                            downloadItem.destroy();
                            return GLib.SOURCE_REMOVE;
                        });
                    } else {
                        this._showError('Download failed: ' + stderr);
                        downloadItem.destroy();
                    }
                } catch (e) {
                    this._showError('Download error: ' + e.message);
                    downloadItem.destroy();
                }
            });
            
            // Progress bar animation (simulated)
            let progress = 0;
            let progressTimer = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 100, () => {
                progress += Math.random() * 2;
                if (progress > 100) progress = 100;
                
                progressBar.set_style(`background-color: #4CAF50; width: ${progress}%;`);
                
                if (progress >= 100) {
                    return GLib.SOURCE_REMOVE;
                }
                return GLib.SOURCE_CONTINUE;
            });
            
        } catch (e) {
            this._showError('Failed to start download: ' + e.message);
            downloadItem.destroy();
        }
    }
    
    _openDirectoryChooser() {
        // Cannot open directory chooser directly in GNOME Shell
        // Open preferences window instead
        this._extension.openPreferences();
    }
    
    _shortenPath(path) {
        if (path.length > 30) {
            return '...' + path.slice(-27);
        }
        return path;
    }
    
    _shortenUrl(url) {
        if (url.length > 40) {
            return url.slice(0, 37) + '...';
        }
        return url;
    }
    
    _showError(message) {
        Main.notify('Ulak', message);
    }
    
    _showSuccess(message) {
        Main.notify('Ulak', message);
    }
    
    destroy() {
        if (this._settings) {
            this._settings = null;
        }
        super.destroy();
    }
});

export default class UlakExtension extends Extension {
    constructor(metadata) {
        super(metadata);
        this._indicator = null;
    }
    
    enable() {
        this._indicator = new UlakIndicator(this);
        Main.panel.addToStatusArea('ulak-indicator', this._indicator);
    }
    
    disable() {
        if (this._indicator) {
            this._indicator.destroy();
            this._indicator = null;
        }
    }
}