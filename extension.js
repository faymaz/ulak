// extension.js - Enhanced with download history and better progress tracking
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
        this._downloads = new Map();
        this._downloadHistory = [];
        
        // Load history from settings
        this._loadHistory();
        
        // Panel icon
        let iconPath = extension.path + '/icons/ulak.png';
        let iconFile = Gio.File.new_for_path(iconPath);
        
        let icon;
        if (iconFile.query_exists(null)) {
            icon = new St.Icon({
                gicon: Gio.icon_new_for_string(iconPath),
                style_class: 'system-status-icon',
            });
        } else {
            icon = new St.Icon({
                icon_name: 'folder-download-symbolic',
                style_class: 'system-status-icon',
            });
        }
        this.add_child(icon);
        
        this._buildMenu();
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
        
        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
        
        // Download button
        this._downloadButton = new PopupMenu.PopupMenuItem('📥 Download');
        this._downloadButton.connect('activate', () => {
            this._startDownload();
        });
        this.menu.addMenuItem(this._downloadButton);
        
        // Download directory
        let downloadDir = this._settings.get_string('download-directory');
        this._dirLabel = new PopupMenu.PopupMenuItem(
            '📁 ' + this._shortenPath(downloadDir),
            { reactive: false }
        );
        this.menu.addMenuItem(this._dirLabel);
        
        let changeDirButton = new PopupMenu.PopupMenuItem('⚙️ Change Directory');
        changeDirButton.connect('activate', () => {
            this._extension.openPreferences();
        });
        this.menu.addMenuItem(changeDirButton);
        
        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
        
        // Active downloads section
        this._downloadsSection = new PopupMenu.PopupMenuSection();
        let downloadsHeader = new PopupMenu.PopupMenuItem('Active Downloads', {
            reactive: false,
            style_class: 'ulak-section-header',
        });
        this.menu.addMenuItem(downloadsHeader);
        this.menu.addMenuItem(this._downloadsSection);
        
        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
        
        // Download history section
        this._historySection = new PopupMenu.PopupMenuSection();
        let historyHeader = new PopupMenu.PopupMenuItem('Recent Downloads', {
            reactive: false,
            style_class: 'ulak-section-header',
        });
        this.menu.addMenuItem(historyHeader);
        this.menu.addMenuItem(this._historySection);
        
        // Clear history button
        let clearHistoryBtn = new PopupMenu.PopupMenuItem('🗑️ Clear History');
        clearHistoryBtn.connect('activate', () => {
            this._clearHistory();
        });
        this.menu.addMenuItem(clearHistoryBtn);
        
        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
        
        // Settings
        let settingsItem = new PopupMenu.PopupMenuItem('⚙️ Settings');
        settingsItem.connect('activate', () => {
            this._extension.openPreferences();
        });
        this.menu.addMenuItem(settingsItem);
        
        // Update history display
        this._updateHistoryDisplay();
    }
    
    _selectQuality(quality) {
        if (this._qualityMenuItems[this._selectedQuality]) {
            this._qualityMenuItems[this._selectedQuality].setOrnament(PopupMenu.Ornament.NONE);
        }
        
        this._selectedQuality = quality;
        if (this._qualityMenuItems[quality]) {
            this._qualityMenuItems[quality].setOrnament(PopupMenu.Ornament.DOT);
        }
        
        this._settings.set_string('default-quality', quality);
    }
    
    _loadSettings() {
        this._downloadDir = this._settings.get_string('download-directory');
        if (this._downloadDir.startsWith('~')) {
            this._downloadDir = GLib.get_home_dir() + this._downloadDir.slice(1);
        }
        
        this._ytDlpPath = this._settings.get_string('yt-dlp-path');
        this._checkYtDlp();
    }
    
    _checkYtDlp() {
        let ytDlpPath = this._ytDlpPath || 'yt-dlp';
        
        try {
            let [success, stdout, stderr, exitCode] = GLib.spawn_command_line_sync(
                `which ${ytDlpPath}`
            );
            
            if (success && exitCode === 0) {
                this._ytDlpAvailable = true;
                console.log('Ulak: yt-dlp found');
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
        
        if (!this._isValidUrl(url)) {
            this._showError('Invalid URL!');
            return;
        }
        
        let command = this._buildDownloadCommand(url);
        this._executeDownload(command, url);
        this._urlEntry.set_text('');
    }
    
    _isValidUrl(url) {
        const patterns = [
            /^https?:\/\/(www\.)?(youtube\.com|youtu\.be|patreon\.com)\/.+/i,
            /^https?:\/\/.*\.patreon\.com\/.+/i
        ];
        
        return patterns.some(pattern => pattern.test(url));
    }
    
    _buildDownloadCommand(url) {
        let ytDlpPath = this._ytDlpPath || 'yt-dlp';
        let outputTemplate = '%(title)s.%(ext)s';
        let outputPath = GLib.build_filenamev([this._downloadDir, outputTemplate]);
        
        let command = ytDlpPath;
        command += ' --no-warnings';
        command += ' --no-playlist';
        command += ' --newline';
        command += ' --progress';
        command += ' --output "' + outputPath + '"';
        
        if (this._selectedQuality === 'audio') {
            command += ' -x --audio-format mp3 --audio-quality 0';
        } else {
            let height = this._selectedQuality.replace('p', '');
            command += ' -f "bestvideo[height<=?' + height + ']+bestaudio/best[height<=?' + height + ']/best"';
            command += ' --merge-output-format mp4';
        }
        
        let cookiesFile = this._settings.get_string('cookies-file');
        if (cookiesFile && cookiesFile.length > 0) {
            let file = Gio.File.new_for_path(cookiesFile);
            if (file.query_exists(null)) {
                command += ' --cookies "' + cookiesFile + '"';
            }
        }
        
        command += ' "' + url + '"';
        return command;
    }
    
    _executeDownload(command, url) {
        let downloadId = Date.now().toString();
        
        // Create download UI
        let downloadItem = new PopupMenu.PopupBaseMenuItem({
            reactive: true,
            can_focus: false,
        });
        
        let box = new St.BoxLayout({
            vertical: true,
            x_expand: true,
            style: 'padding: 8px; spacing: 6px;',
        });
        
        // Title and source
        let sourceIcon = url.includes('youtube') ? '📺' : '🎬';
        let sourceName = url.includes('youtube') ? 'YouTube' : 'Patreon';
        
        let titleLabel = new St.Label({
            text: sourceIcon + ' Downloading from ' + sourceName + '...',
            style_class: 'ulak-download-title',
        });
        
        let urlLabel = new St.Label({
            text: this._shortenUrl(url),
            style: 'font-size: 11px; color: rgba(255,255,255,0.6);',
        });
        
        // Progress container
        let progressBox = new St.BoxLayout({
            vertical: false,
            x_expand: true,
            style: 'spacing: 8px;',
        });
        
        // Progress bar background
        let progressBg = new St.Widget({
            style: 'background-color: rgba(255,255,255,0.1); height: 20px; border-radius: 10px;',
            x_expand: true,
        });
        
        // Progress bar fill
        let progressFill = new St.Widget({
            style: 'background: linear-gradient(90deg, #4CAF50 0%, #45a049 100%); height: 20px; border-radius: 10px; width: 0%;',
            x_align: Clutter.ActorAlign.START,
        });
        
        progressBg.add_child(progressFill);
        
        // Progress text
        let progressText = new St.Label({
            text: '0%',
            style: 'font-size: 11px; min-width: 40px;',
        });
        
        progressBox.add_child(progressBg);
        progressBox.add_child(progressText);
        
        // Speed and ETA
        let statsLabel = new St.Label({
            text: 'Starting download...',
            style: 'font-size: 10px; color: rgba(255,255,255,0.5);',
        });
        
        box.add_child(titleLabel);
        box.add_child(urlLabel);
        box.add_child(progressBox);
        box.add_child(statsLabel);
        
        downloadItem.add_child(box);
        this._downloadsSection.addMenuItem(downloadItem, 0);
        
        // Store download info
        this._downloads.set(downloadId, {
            item: downloadItem,
            url: url,
            titleLabel: titleLabel,
            progressFill: progressFill,
            progressText: progressText,
            statsLabel: statsLabel,
            startTime: Date.now(),
            source: sourceName,
        });
        
        console.log('Ulak: Executing: ' + command);
        
        // Execute download with output monitoring
        try {
            let [, , , stderrFd] = GLib.spawn_async_with_pipes(
                null,
                ['/bin/bash', '-c', command],
                null,
                GLib.SpawnFlags.DO_NOT_REAP_CHILD | GLib.SpawnFlags.SEARCH_PATH,
                null
            );
            
            // Monitor stderr for progress
            let stderrStream = new Gio.DataInputStream({
                base_stream: new Gio.UnixInputStream({ fd: stderrFd, close_fd: true }),
            });
            
            this._monitorDownloadProgress(stderrStream, downloadId, url);
            
        } catch (e) {
            console.error('Ulak error: ' + e.message);
            this._showError('Failed to start download: ' + e.message);
            this._removeDownload(downloadId, false);
        }
    }
    
    _monitorDownloadProgress(stream, downloadId, url) {
        stream.read_line_async(GLib.PRIORITY_DEFAULT, null, (source, result) => {
            try {
                let [line] = source.read_line_finish_utf8(result);
                
                if (line !== null) {
                    this._parseProgressLine(line, downloadId);
                    
                    // Continue reading
                    this._monitorDownloadProgress(stream, downloadId, url);
                } else {
                    // Download finished
                    this._onDownloadComplete(downloadId, url);
                }
            } catch (e) {
                console.error('Ulak progress monitor error: ' + e.message);
                this._removeDownload(downloadId, false);
            }
        });
    }
    
    _parseProgressLine(line, downloadId) {
        let download = this._downloads.get(downloadId);
        if (!download) return;
        
        // Parse yt-dlp progress output
        // Format: [download]   X.X% of Y.YMiB at Z.ZMiB/s ETA MM:SS
        
        let percentMatch = line.match(/(\d+\.?\d*)%/);
        let speedMatch = line.match(/at\s+([\d.]+\s*[KMG]iB\/s)/i);
        let etaMatch = line.match(/ETA\s+([\d:]+)/);
        let sizeMatch = line.match(/of\s+([\d.]+\s*[KMG]iB)/i);
        
        if (percentMatch) {
            let percent = parseFloat(percentMatch[1]);
            download.progressFill.set_style(
                `background: linear-gradient(90deg, #4CAF50 0%, #45a049 100%); 
                 height: 20px; border-radius: 10px; width: ${percent}%;`
            );
            download.progressText.set_text(percent.toFixed(1) + '%');
        }
        
        if (speedMatch || etaMatch || sizeMatch) {
            let statsText = [];
            if (sizeMatch) statsText.push(sizeMatch[1]);
            if (speedMatch) statsText.push(speedMatch[1]);
            if (etaMatch) statsText.push('ETA ' + etaMatch[1]);
            
            download.statsLabel.set_text(statsText.join(' • '));
        }
        
        // Check for filename in output
        let destMatch = line.match(/Destination:\s*(.+)/);
        if (destMatch) {
            download.filename = destMatch[1].trim();
        }
        
        let mergeMatch = line.match(/Merging formats into "(.+)"/);
        if (mergeMatch) {
            download.filename = mergeMatch[1].trim();
        }
    }
    
    _onDownloadComplete(downloadId, url) {
        let download = this._downloads.get(downloadId);
        if (!download) return;
        
        let filename = download.filename || 'Unknown';
        let filepath = GLib.build_filenamev([this._downloadDir, filename]);
        
        // Update UI
        download.titleLabel.set_text('✅ Completed!');
        download.progressFill.set_style(
            'background: linear-gradient(90deg, #4CAF50 0%, #8BC34A 100%); height: 20px; border-radius: 10px; width: 100%;'
        );
        download.progressText.set_text('100%');
        download.statsLabel.set_text('Download complete');
        
        // Add to history
        this._addToHistory({
            url: url,
            filename: filename,
            filepath: filepath,
            source: download.source,
            timestamp: Date.now(),
            quality: this._selectedQuality,
        });
        
        this._showSuccess('Download completed: ' + filename);
        
        // Remove from active downloads after 3 seconds
        GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 3, () => {
            this._removeDownload(downloadId, true);
            return GLib.SOURCE_REMOVE;
        });
    }
    
    _removeDownload(downloadId, completed) {
        let download = this._downloads.get(downloadId);
        if (download && download.item) {
            download.item.destroy();
        }
        this._downloads.delete(downloadId);
    }
    
    _loadHistory() {
        try {
            let historyJson = this._settings.get_string('download-history');
            if (historyJson && historyJson !== '[]') {
                this._downloadHistory = JSON.parse(historyJson);
            }
        } catch (e) {
            console.error('Ulak: Failed to load history: ' + e.message);
            this._downloadHistory = [];
        }
    }
    
    _saveHistory() {
        try {
            // Keep only last 20 items
            if (this._downloadHistory.length > 20) {
                this._downloadHistory = this._downloadHistory.slice(0, 20);
            }
            
            let historyJson = JSON.stringify(this._downloadHistory);
            this._settings.set_string('download-history', historyJson);
        } catch (e) {
            console.error('Ulak: Failed to save history: ' + e.message);
        }
    }
    
    _addToHistory(item) {
        this._downloadHistory.unshift(item);
        this._saveHistory();
        this._updateHistoryDisplay();
    }
    
    _clearHistory() {
        this._downloadHistory = [];
        this._saveHistory();
        this._updateHistoryDisplay();
        this._showSuccess('History cleared');
    }
    
    _updateHistoryDisplay() {
        // Clear existing items
        this._historySection.removeAll();
        
        if (this._downloadHistory.length === 0) {
            let emptyItem = new PopupMenu.PopupMenuItem('No downloads yet', {
                reactive: false,
                style_class: 'ulak-small-text',
            });
            this._historySection.addMenuItem(emptyItem);
            return;
        }
        
        // Show last 5 items
        let itemsToShow = this._downloadHistory.slice(0, 5);
        
        for (let historyItem of itemsToShow) {
            let menuItem = new PopupMenu.PopupBaseMenuItem({
                reactive: true,
            });
            
            let box = new St.BoxLayout({
                vertical: true,
                x_expand: true,
                style: 'spacing: 4px;',
            });
            
            let sourceIcon = historyItem.source === 'YouTube' ? '📺' : '🎬';
            let titleLabel = new St.Label({
                text: sourceIcon + ' ' + this._extractTitle(historyItem.filename),
                style: 'font-size: 12px; font-weight: 500;',
            });
            
            let detailsBox = new St.BoxLayout({
                vertical: false,
                x_expand: true,
                style: 'spacing: 8px;',
            });
            
            let sourceLabel = new St.Label({
                text: historyItem.source,
                style: 'font-size: 10px; color: rgba(255,255,255,0.5);',
            });
            
            let qualityLabel = new St.Label({
                text: historyItem.quality,
                style: 'font-size: 10px; color: rgba(255,255,255,0.5);',
            });
            
            let timeLabel = new St.Label({
                text: this._formatTimestamp(historyItem.timestamp),
                style: 'font-size: 10px; color: rgba(255,255,255,0.5);',
            });
            
            detailsBox.add_child(sourceLabel);
            detailsBox.add_child(new St.Label({ text: '•', style: 'font-size: 10px; color: rgba(255,255,255,0.3);' }));
            detailsBox.add_child(qualityLabel);
            detailsBox.add_child(new St.Label({ text: '•', style: 'font-size: 10px; color: rgba(255,255,255,0.3);' }));
            detailsBox.add_child(timeLabel);
            
            box.add_child(titleLabel);
            box.add_child(detailsBox);
            
            menuItem.add_child(box);
            
            // Click to open file location
            menuItem.connect('activate', () => {
                try {
                    GLib.spawn_command_line_async(`xdg-open "${this._downloadDir}"`);
                } catch (e) {
                    this._showError('Failed to open folder');
                }
            });
            
            this._historySection.addMenuItem(menuItem);
        }
    }
    
    _extractTitle(filename) {
        // Remove extension and shorten
        let title = filename.replace(/\.[^/.]+$/, '');
        if (title.length > 40) {
            return title.substring(0, 37) + '...';
        }
        return title;
    }
    
    _formatTimestamp(timestamp) {
        let now = Date.now();
        let diff = now - timestamp;
        let seconds = Math.floor(diff / 1000);
        let minutes = Math.floor(seconds / 60);
        let hours = Math.floor(minutes / 60);
        let days = Math.floor(hours / 24);
        
        if (days > 0) return days + 'd ago';
        if (hours > 0) return hours + 'h ago';
        if (minutes > 0) return minutes + 'm ago';
        return 'just now';
    }
    
    _shortenPath(path) {
        if (path.length > 30) {
            return '...' + path.slice(-27);
        }
        return path;
    }
    
    _shortenUrl(url) {
        if (url.length > 50) {
            return url.slice(0, 47) + '...';
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