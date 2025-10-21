import Gtk from 'gi://Gtk';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Adw from 'gi://Adw';
import {ExtensionPreferences} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class UlakPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const settings = this.getSettings();
        
      
        const page = new Adw.PreferencesPage({
            title: 'Ulak Settings',
            icon_name: 'folder-download-symbolic',
        });
        window.add(page);
        
      
        const generalGroup = new Adw.PreferencesGroup({
            title: 'General Settings',
            description: 'Configure video download settings',
        });
        page.add(generalGroup);
        
      
        const downloadDirRow = new Adw.ActionRow({
            title: 'Download Directory',
            subtitle: settings.get_string('download-directory'),
        });
        
        const dirButton = new Gtk.Button({
            label: 'Choose Directory',
            valign: Gtk.Align.CENTER,
        });
        
        dirButton.connect('clicked', () => {
            const dialog = new Gtk.FileChooserDialog({
                title: 'Select Download Directory',
                action: Gtk.FileChooserAction.SELECT_FOLDER,
                transient_for: window,
                modal: true,
            });
            
            dialog.add_button('Cancel', Gtk.ResponseType.CANCEL);
            dialog.add_button('Select', Gtk.ResponseType.ACCEPT);
            
            dialog.connect('response', (dialog, response) => {
                if (response === Gtk.ResponseType.ACCEPT) {
                    const file = dialog.get_file();
                    if (file) {
                        const path = file.get_path();
                        settings.set_string('download-directory', path);
                        downloadDirRow.set_subtitle(path);
                    }
                }
                dialog.destroy();
            });
            
            dialog.show();
        });
        
        downloadDirRow.add_suffix(dirButton);
        generalGroup.add(downloadDirRow);
        
      
        const qualityRow = new Adw.ComboRow({
            title: 'Default Video Quality',
            subtitle: 'Default quality for downloads',
        });
        
        const qualityOptions = ['2160p', '1440p', '1080p', '720p', '480p', '360p', 'audio'];
        const qualityModel = new Gtk.StringList();
        qualityOptions.forEach(q => qualityModel.append(q));
        qualityRow.set_model(qualityModel);
        
      
        const currentQuality = settings.get_string('default-quality');
        const currentIndex = qualityOptions.indexOf(currentQuality);
        if (currentIndex >= 0) {
            qualityRow.set_selected(currentIndex);
        }
        
        qualityRow.connect('notify::selected', () => {
            const selected = qualityRow.get_selected();
            if (selected >= 0 && selected < qualityOptions.length) {
                settings.set_string('default-quality', qualityOptions[selected]);
            }
        });
        
        generalGroup.add(qualityRow);
        
      
        const advancedGroup = new Adw.PreferencesGroup({
            title: 'Advanced Settings',
            description: 'yt-dlp and other advanced settings',
        });
        page.add(advancedGroup);
        
      
        const ytDlpRow = new Adw.EntryRow({
            title: 'yt-dlp Path',
            text: settings.get_string('yt-dlp-path') || 'yt-dlp',
        });
        
        ytDlpRow.connect('notify::text', () => {
            settings.set_string('yt-dlp-path', ytDlpRow.get_text());
        });
        
        advancedGroup.add(ytDlpRow);
        
      
        const concurrentRow = new Adw.SpinRow({
            title: 'Concurrent Downloads',
            subtitle: 'Number of simultaneous downloads',
            adjustment: new Gtk.Adjustment({
                lower: 1,
                upper: 5,
                step_increment: 1,
                page_increment: 1,
                value: settings.get_int('max-concurrent-downloads'),
            }),
        });
        
        concurrentRow.connect('notify::value', () => {
            settings.set_int('max-concurrent-downloads', concurrentRow.get_value());
        });
        
        advancedGroup.add(concurrentRow);
        
      
        const cookiesRow = new Adw.ActionRow({
            title: 'Cookies File (for Patreon)',
            subtitle: settings.get_string('cookies-file') || 'Not selected',
        });
        
        const cookiesButton = new Gtk.Button({
            label: 'Choose File',
            valign: Gtk.Align.CENTER,
        });
        
        cookiesButton.connect('clicked', () => {
            const dialog = new Gtk.FileChooserDialog({
                title: 'Select Cookies File',
                action: Gtk.FileChooserAction.OPEN,
                transient_for: window,
                modal: true,
            });
            
          
            const filter = new Gtk.FileFilter();
            filter.set_name('Cookies files');
            filter.add_pattern('*.txt');
            filter.add_pattern('cookies.txt');
            dialog.add_filter(filter);
            
            dialog.add_button('Cancel', Gtk.ResponseType.CANCEL);
            dialog.add_button('Select', Gtk.ResponseType.ACCEPT);
            
            dialog.connect('response', (dialog, response) => {
                if (response === Gtk.ResponseType.ACCEPT) {
                    const file = dialog.get_file();
                    if (file) {
                        const path = file.get_path();
                        settings.set_string('cookies-file', path);
                        cookiesRow.set_subtitle(path);
                    }
                }
                dialog.destroy();
            });
            
            dialog.show();
        });
        
        const clearCookiesButton = new Gtk.Button({
            label: 'Clear',
            valign: Gtk.Align.CENTER,
        });
        
        clearCookiesButton.connect('clicked', () => {
            settings.set_string('cookies-file', '');
            cookiesRow.set_subtitle('Not selected');
        });
        
        cookiesRow.add_suffix(cookiesButton);
        cookiesRow.add_suffix(clearCookiesButton);
        advancedGroup.add(cookiesRow);
        
      
        const notificationSwitch = new Adw.SwitchRow({
            title: 'Download Notifications',
            subtitle: 'Show notification when download completes',
            active: settings.get_boolean('show-notifications'),
        });
        
        notificationSwitch.connect('notify::active', () => {
            settings.set_boolean('show-notifications', notificationSwitch.get_active());
        });
        
        advancedGroup.add(notificationSwitch);
        
      
        const historySwitch = new Adw.SwitchRow({
            title: 'Save Download History',
            subtitle: 'Keep history of downloaded videos',
            active: settings.get_boolean('save-history'),
        });
        
        historySwitch.connect('notify::active', () => {
            settings.set_boolean('save-history', historySwitch.get_active());
        });
        
        advancedGroup.add(historySwitch);
        
      
        const aboutGroup = new Adw.PreferencesGroup({
            title: 'About',
        });
        page.add(aboutGroup);
        
        const aboutRow = new Adw.ActionRow({
            title: 'Ulak Video Downloader',
            subtitle: 'YouTube and Patreon video downloader\nDeveloper: @faymaz',
        });
        
        const githubButton = new Gtk.LinkButton({
            label: 'GitHub',
            uri: 'https://github.com/faymaz/ulak',
            valign: Gtk.Align.CENTER,
        });
        
        aboutRow.add_suffix(githubButton);
        aboutGroup.add(aboutRow);
        
      
        const helpRow = new Adw.ActionRow({
            title: 'Installation Help',
            subtitle: 'yt-dlp installation and usage',
        });
        
        const helpButton = new Gtk.Button({
            label: 'Help',
            valign: Gtk.Align.CENTER,
        });
        
        helpButton.connect('clicked', () => {
            const helpDialog = new Gtk.MessageDialog({
                transient_for: window,
                modal: true,
                message_type: Gtk.MessageType.INFO,
                buttons: Gtk.ButtonsType.OK,
                text: 'yt-dlp Installation',
                secondary_text: 'To install yt-dlp:\n\n' +
                    '1. Open terminal\n' +
                    '2. Run one of these commands:\n' +
                    '   sudo pip install -U yt-dlp\n' +
                    '   or\n' +
                    '   sudo apt install yt-dlp\n\n' +
                    'For Patreon videos:\n' +
                    '1. Export cookies.txt from your browser\n' +
                    '2. Select the cookies file in settings',
            });
            
            helpDialog.connect('response', () => helpDialog.destroy());
            helpDialog.show();
        });
        
        helpRow.add_suffix(helpButton);
        aboutGroup.add(helpRow);
    }
}