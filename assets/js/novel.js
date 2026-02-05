document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const body = document.body;
    const header = document.querySelector('.novel-header');
    const footer = document.querySelector('.novel-footer');
    const settingsModal = document.querySelector('.settings-modal');
    const clickZone = document.querySelector('.click-zone');
    const settingsToggle = document.getElementById('settings-toggle');
    const closeSettings = document.getElementById('close-settings');
    const fontSizeSlider = document.getElementById('font-size-slider');

    // State
    let isUiVisible = true;
    
    // Default Settings
    const defaultSettings = {
        theme: 'white',
        font: 'sans',
        size: 18
    };

    // Load Settings
    function loadSettings() {
        let saved;
        try {
            const stored = localStorage.getItem('novelSettings');
            saved = stored ? JSON.parse(stored) : defaultSettings;
        } catch (e) {
            console.error('Error parsing settings:', e);
            saved = defaultSettings;
        }

        // Apply saved settings
        applyTheme(saved.theme || defaultSettings.theme);
        applyFont(saved.font || defaultSettings.font);
        applySize(saved.size || defaultSettings.size);
        
        // Sync UI controls
        if (fontSizeSlider) {
            fontSizeSlider.value = saved.size || defaultSettings.size;
        }
    }

    // Apply Functions
    function applyTheme(theme) {
        // Remove all theme classes
        const themeClasses = Array.from(body.classList).filter(cls => cls.startsWith('theme-'));
        body.classList.remove(...themeClasses);
        
        body.classList.add(`theme-${theme}`);
        updateActiveBtn('theme', theme);
        saveSetting('theme', theme);
    }

    function applyFont(font) {
        // Remove all font classes
        const fontClasses = Array.from(body.classList).filter(cls => cls.startsWith('font-'));
        body.classList.remove(...fontClasses);
        
        body.classList.add(`font-${font}`);
        updateActiveBtn('font', font);
        saveSetting('font', font);
    }

    function applySize(size) {
        // Set CSS variable on body for better scoping
        body.style.setProperty('--novel-size', `${size}px`);
        saveSetting('size', size);
    }

    function updateActiveBtn(type, value) {
        document.querySelectorAll(`.${type}-btn`).forEach(btn => {
            if (btn.dataset.value === value) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    function saveSetting(key, value) {
        try {
            const stored = localStorage.getItem('novelSettings');
            const current = stored ? JSON.parse(stored) : { ...defaultSettings };
            current[key] = value;
            localStorage.setItem('novelSettings', JSON.stringify(current));
        } catch (e) {
            console.error('Error saving setting:', e);
        }
    }

    // Event Listeners

    // Toggle UI (Center Tap)
    if (clickZone) {
        clickZone.addEventListener('click', (e) => {
            // If settings modal is open, close it instead of toggling UI
            if (settingsModal && settingsModal.classList.contains('active')) {
                settingsModal.classList.remove('active');
                return;
            }

            isUiVisible = !isUiVisible;
            if (isUiVisible) {
                header?.classList.remove('hidden');
                footer?.classList.remove('hidden');
            } else {
                header?.classList.add('hidden');
                footer?.classList.add('hidden');
            }
        });
    }

    // Settings Toggle
    if (settingsToggle) {
        settingsToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            settingsModal?.classList.toggle('active');
            // Ensure UI is visible when settings open
            header?.classList.remove('hidden');
            footer?.classList.remove('hidden');
            isUiVisible = true;
        });
    }

    if (closeSettings) {
        closeSettings.addEventListener('click', () => {
            settingsModal?.classList.remove('active');
        });
    }

    // Theme Buttons
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const theme = btn.dataset.value;
            if (theme) applyTheme(theme);
        });
    });

    // Font Buttons
    document.querySelectorAll('.font-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const font = btn.dataset.value;
            if (font) applyFont(font);
        });
    });

    // Font Size Slider
    if (fontSizeSlider) {
        fontSizeSlider.addEventListener('input', (e) => {
            applySize(e.target.value);
        });
    }

    // Initialize
    loadSettings();
});
