import { UIComponents } from './components.js';
import { UIEvents } from './events.js';

// Assume CoreEvents is available via window.A or imported
const CoreEvents = window.A?.events;

export const UI = {
    async init() {
        console.log('[UI] Initializing UI components');
        this.initializeTheme();
        this.setupRunButton(); // Add this call
    },

    initializeTheme() {
        const themeToggleButton = document.getElementById('theme-toggle');
        if (themeToggleButton) {
            themeToggleButton.addEventListener('click', () => {
                const theme = document.documentElement.getAttribute('data-theme');
                const newTheme = theme === 'dark' ? 'light' : 'dark';
                document.documentElement.setAttribute('data-theme', newTheme);
                CoreEvents?.emit('ui:themeChanged', { theme: newTheme });
            });
        } else {
            console.warn('[UI] Theme toggle element not found'); // Use warn instead of error
        }
    },

    // --- Add Run Button Logic ---
    setupRunButton() {
        const runButton = document.getElementById('run-builder-btn');
        if (runButton) {
            if (!CoreEvents) {
                console.error('[UI] CoreEvents not available for Run Button.');
                runButton.disabled = true;
                runButton.title = "Error: Event system not loaded.";
                return;
            }
            runButton.addEventListener('click', () => {
                console.log('[UI] Run Flow button clicked. Emitting builder:run:request.');
                CoreEvents.emit('builder:run:request');
                // Optionally disable button while running
                // runButton.disabled = true;
                // runButton.textContent = 'Running...';
            });

            // Example: Listen for completion to re-enable button
            // CoreEvents.on('builder:run:complete', () => {
            //     runButton.disabled = false;
            //     runButton.textContent = 'Run Flow';
            // });
            // CoreEvents.on('builder:run:error', () => {
            //     runButton.disabled = false;
            //     runButton.textContent = 'Run Flow';
            // });

        } else {
            console.warn('[UI] Run button element not found');
        }
    }
    // --- End Run Button Logic ---
};

// Ensure UI module itself is registered if needed by others,
// although it might primarily interact via DOM and events.
// Consider if registration is necessary for your architecture.
// import { Registry as CoreRegistry } from '/core/registry.js';
// CoreRegistry?.registerModule('ui', UI);