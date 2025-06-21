console.log('[ui.js] Loaded and executing (ESM)');

// If you need events, import them as an ES module
import { executeQuery } from './network.js';// import { Events } from '/core/events.js'; // Uncomment if neededimport { executeQuery } from './network.js';;
import { verifyAccess } from './auth.js';

// Private state
let container = null;
let terminalWrapper = null;
let terminalHistory = null;
let inputElement = null;
let isExpanded = false;

const accessPhrases = {
    master: ["funk_yeah", "i_am_dno", "hey_babes"].map(p => p.toLowerCase()),
    admin: ["add_ming", "paid_up", "yooo"].map(p => p.toLowerCase()),
    standard: ["level-one", "i-am-the-one", "pancakes"].map(p => p.toLowerCase())
};
let isVerified = false;
let accessLevel = 'guest';



// DOM creation helpers
function createTerminal() {
    terminalWrapper = document.createElement('div');
    terminalWrapper.id = 'terminal-wrapper';
    terminalWrapper.className = 'terminal-small';

    terminalWrapper.style.position = 'fixed';
    terminalWrapper.style.zIndex = 10;

    terminalWrapper.innerHTML = `
        <header class="terminal-header">
            <span class="title">CybrJustice // Truth Engine v0.2</span>
            <div class="controls">
                <span id="minimize-btn" title="Minimize">_</span>
                <span id="maximize-btn" title="Maximize">□</span>
                <span id="close-btn" title="Close">×</span>
            </div>
        </header>
        <div class="terminal-body">
            <div id="terminal-history">
                <div class="output-line system-message">CybrJustice presents: Ingenium Veritas v0.2</div>
                <div class="output-line system-message">Initializing analysis core... Access granted.</div>
                <p>> Initializing truth protocol...</p>
                <p>> Establishing secure connection...</p>
                <p>> Click 'VERIFY' to begin identity check.</p>
            </div>
            <div class="terminal-input-line">
                <span class="prompt">$</span>
                <input type="text" id="truth-input" placeholder="Awaiting verification..." autocomplete="off" spellcheck="false" disabled>
            </div>
            <div class="initial-controls">
                <button id="verify-btn" class="cybr-button">VERIFY</button>
            </div>
        </div>
    `;
   
    
    // Make terminal draggable
    let isDragging = false;
    let dragOffsetX = 0;
    let dragOffsetY = 0;
    
    const header = terminalWrapper.querySelector('.terminal-header');
    header.style.cursor = 'move';
    
    header.addEventListener('mousedown', (e) => {
        isDragging = true;
        dragOffsetX = e.clientX - terminalWrapper.offsetLeft;
        dragOffsetY = e.clientY - terminalWrapper.offsetTop;
        document.body.style.userSelect = 'none';
    });
    
    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            terminalWrapper.style.left = (e.clientX - dragOffsetX) + 'px';
            terminalWrapper.style.top = (e.clientY - dragOffsetY) + 'px';
            terminalWrapper.style.right = 'auto';
            terminalWrapper.style.bottom = 'auto';
        }
    });
    
    document.addEventListener('mouseup', () => {
        isDragging = false;
        document.body.style.userSelect = '';
    });
    // Append styles
    const styleElement = document.createElement('style');
    styleElement.textContent = `
#terminal-wrapper {
  position: fixed;
  z-index: 10;
  width: 600px;
  min-height: 350px;
  max-height: 80vh;
  bottom: 40px;
  left: 40px;
  background: #181622; /* Very dark purple-gray */
  color: #bdbaff;
  border: 2px solid #6c3eb7;
  border-radius: 10px;
  box-shadow: 0 0 24px #6c3eb755, 0 0 4px #6c3eb744;
  display: flex;
  flex-direction: column;
  font-family: 'Share Tech Mono', 'Fira Mono', 'Consolas', monospace;
  overflow: hidden;
}
.terminal-header {
  background: #120c1c;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #6c3eb7;
  box-shadow: 0 2px 8px #6c3eb722;
}
.terminal-header .title {
  font-weight: bold;
  font-size: 1.1em;
  letter-spacing: 1px;
  color: #7d5fff;
  text-shadow: 0 0 8px #6c3eb7, 0 0 2px #fff1;
}
.terminal-header .controls span {
  margin-left: 12px;
  cursor: pointer;
  font-size: 1.2em;
  color: #7d5fff;
  text-shadow: 0 0 6px #6c3eb7;
  transition: color 0.2s;
}
.terminal-header .controls span:hover {
  color: #fff;
  text-shadow: 0 0 12px #7d5fff, 0 0 2px #fff;
}
.terminal-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 16px;
  overflow-y: auto;
  background: #181622;
}
#terminal-history {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 12px;
}
.output-line {
  font-size: 1em;
  margin-bottom: 2px;
  word-break: break-word;
  text-shadow: 0 0 2px #6c3eb755;
}
.output-line.system-message {
  color: #7d5fff;
  text-shadow: 0 0 8px #6c3eb7, 0 0 2px #fff1;
}
.output-line.error-message {
  color: #ff4dff;
  text-shadow: 0 0 8px #ff4dff, 0 0 2px #fff;
}
.output-line.user-input {
  color: #bdbaff;
  text-shadow: 0 0 8px #6c3eb7, 0 0 2px #fff1;
}
.terminal-input-line {
  display: flex;
  align-items: center;
  margin-top: 8px;
}
.terminal-input-line .prompt {
  margin-right: 8px;
  color: #7d5fff;
  text-shadow: 0 0 8px #6c3eb7, 0 0 2px #fff1;
}
#truth-input {
  flex: 1;
  background: #120c1c;
  color: #d1d0e0;
  border: 1px solid #6c3eb7;
  border-radius: 4px;
  padding: 6px 10px;
  font-size: 1em;
  outline: none;
  box-shadow: 0 0 8px #6c3eb744;
  transition: border 0.2s, box-shadow 0.2s;
}
#truth-input:focus {
  border: 1.5px solid #7d5fff;
  box-shadow: 0 0 16px #6c3eb799;
}
.initial-controls {
  margin-top: 12px;
  text-align: right;
}
.cybr-button {
  background: #6c3eb7;
  color: #181622;
  border: none;
  border-radius: 4px;
  padding: 6px 18px;
  font-size: 1em;
  cursor: pointer;
  font-family: inherit;
  font-weight: bold;
  box-shadow: 0 0 8px #6c3eb755;
  transition: background 0.2s, color 0.2s, box-shadow 0.2s;
}
.cybr-button:hover {
  background: #fff;
  color: #6c3eb7;
  box-shadow: 0 0 16px #7d5fffcc;
}
.markdown-body {
  color: #d1d0e0;
  font-size: 1em;
  line-height: 1.6;
  margin: 8px 0;
}
.markdown-body a {
  color: #a259f7;
  text-decoration: underline;
}
.markdown-body code {
  background: #221a33;
  color: #ffb86c;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.95em;
}
.markdown-body pre {
  background: #221a33;
  color: #ffb86c;
  padding: 8px;
  border-radius: 6px;
  overflow-x: auto;
}
.markdown-body ul, .markdown-body ol {
  margin-left: 1.5em;
}
    `;
    document.head.appendChild(styleElement);

    // Add terminal to container
    container.appendChild(terminalWrapper);

    // Get references
    terminalHistory = terminalWrapper.querySelector('#terminal-history');
    inputElement = terminalWrapper.querySelector('#truth-input');

    // Set up event listeners
    setupEventListeners();
  
    return terminalWrapper;
}

function setupEventListeners() {
    const minimizeBtn = terminalWrapper.querySelector('#minimize-btn');
    const maximizeBtn = terminalWrapper.querySelector('#maximize-btn');
    const closeBtn = terminalWrapper.querySelector('#close-btn');
    const verifyBtn = terminalWrapper.querySelector('#verify-btn');

    if (minimizeBtn) minimizeBtn.addEventListener('click', minimize);
    if (maximizeBtn) maximizeBtn.addEventListener('click', maximize);
    if (closeBtn) closeBtn.addEventListener('click', hide);
    if (verifyBtn) verifyBtn.addEventListener('click', startVerification);
}

function onUserSubmit(input) {
    terminalHistory.innerHTML += `<div class="output-line user-input"><span>$ ${input}</span></div>`;

    executeQuery(input, {
        onComplete: (fullResponse, { isDone, citations }) => {
            addToHistory(fullResponse, false, false, true);
            if (citations && citations.length > 0) {
                addToHistory("Sources: " + citations.map(c => `<a href="${c.url}" target="_blank">${c.title}</a>`).join(', '), false, false, true);
            }
            terminalHistory.scrollTop = terminalHistory.scrollHeight;
        }
    });
}

// Example: render markdown in terminal
function renderMarkdownToTerminal(markdownText) {
    const html = marked.parse(markdownText); // marked() also works
    const container = document.getElementById('terminal-history');
    if (container) {
        container.innerHTML += `<div class="markdown-body">${html}</div>`;
    }
}



// Public methods
export function init(targetContainer) {
    container = targetContainer;
    if (!container) {
        console.log('[TruthEngine:UI] No container provided, deferring initialization');
        return false;
    }

    createTerminal();
    console.log('[TruthEngine:UI] Terminal interface initialized');
    return true;
}

export function setContainer(newContainer) {
    if (newContainer && newContainer !== container) {
        if (terminalWrapper && container) {
            container.removeChild(terminalWrapper);
        }
        container = newContainer;
        if (terminalWrapper) {
            container.appendChild(terminalWrapper);
        } else {
            createTerminal();
        }
        return true;
    }
    return false;
}

export function addToHistory(text, isCommand = false, isError = false, isAi = false) {
    const className = isCommand ? 'command-output' : isError ? 'error-output' : isAi ? 'ai-output' : 'standard-output';
    const outputLine = document.createElement('div');
    outputLine.classList.add('output-line', className);

    // Parse Markdown
    const html = marked.parse(text);
    outputLine.innerHTML = html;

    terminalHistory.appendChild(outputLine);
    terminalHistory.scrollTop = terminalHistory.scrollHeight;
}

export function updateInputState(isEnabled, placeholder = null) {
    if (!inputElement) return;

    inputElement.disabled = !isEnabled;
    if (placeholder) {
        inputElement.placeholder = placeholder;
    }

    if (isEnabled) {
        inputElement.focus();
    }
}

export function minimize() {
    if (!terminalWrapper) return;
    terminalWrapper.style.display = 'none';
    // Optionally, show a restore button somewhere
    let restoreBtn = document.getElementById('terminal-restore-btn');
    if (!restoreBtn) {
        restoreBtn = document.createElement('button');
        restoreBtn.id = 'terminal-restore-btn';
        restoreBtn.textContent = 'Restore Terminal';
        restoreBtn.style.position = 'fixed';
        restoreBtn.style.bottom = '10px';
        restoreBtn.style.left = '10px';
        restoreBtn.style.zIndex = 10000;
        restoreBtn.onclick = () => {
            terminalWrapper.style.display = 'flex';
            restoreBtn.remove();
        };
        document.body.appendChild(restoreBtn);
    }
}

export function maximize() {
    if (!terminalWrapper) return;
    terminalWrapper.style.width = '95vw';
    terminalWrapper.style.height = '90vh';
    terminalWrapper.style.top = '2.5vh';
    terminalWrapper.style.left = '2.5vw';
    terminalWrapper.style.right = 'auto';
    terminalWrapper.style.bottom = 'auto';
    terminalWrapper.style.position = 'fixed';
}

export function hide() {
    if (terminalWrapper) {
        terminalWrapper.style.display = 'none';
    }
}

// Matrix background initialization
let matrixRainColor = '#00FF41'; // Default green

export function setMatrixRainColor(color) {
    matrixRainColor = color;
}

export function initMatrixBackground(canvas) {
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const fontSize = 14;
    let columns, drops, animationFrame;

    function resizeCanvas() {
        canvas.width = canvas.offsetWidth || window.innerWidth;
        canvas.height = canvas.offsetHeight || window.innerHeight;
        columns = Math.floor(canvas.width / fontSize);
        drops = [];
        for (let i = 0; i < columns; i++) {
            drops[i] = Math.floor(Math.random() * canvas.height / fontSize);
        }
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモ$£¥€+<>[](){}#@:;.,?!=%';

    function draw() {
        ctx.fillStyle = 'rgba(13, 13, 13, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = `${fontSize}px monospace`;

        for (let i = 0; drops.length; i++) {
            const text = chars[Math.floor(Math.random() * chars.length)];
            ctx.fillStyle = matrixRainColor;
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);
            drops[i]++;
            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
        }
        animationFrame = requestAnimationFrame(draw);
    }
    draw();

    // Return a cleanup function if needed
    return () => {
        cancelAnimationFrame(animationFrame);
        window.removeEventListener('resize', resizeCanvas);
        canvas.remove();
    };
}

export function startMatrixRain(container, color = '#36013F') {
    let canvas = document.createElement('canvas');
    canvas.id = 'matrix-background';
    canvas.style.position = 'fixed';
    canvas.style.top = 0;
    canvas.style.left = 0;
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = 0;
    container.appendChild(canvas);

    let ctx = canvas.getContext('2d');
    let fontSize = 16;
    let columns, rainDrops;

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        columns = Math.floor(canvas.width / fontSize);
        rainDrops = Array(columns).fill(1);
    }
    resize();
    window.addEventListener('resize', resize);

    const chars = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッンABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let animationFrame;

    function draw() {
        ctx.fillStyle = 'rgba(13, 13, 13, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = fontSize + 'px "Share Tech Mono", monospace';
        ctx.fillStyle = color;
        for (let i = 0; i < rainDrops.length; i++) {
            let text = chars.charAt(Math.floor(Math.random() * chars.length));
            ctx.fillText(text, i * fontSize, rainDrops[i] * fontSize);
            if (rainDrops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                rainDrops[i] = 0;
            }
            rainDrops[i]++;
        }
        animationFrame = requestAnimationFrame(draw);
    }
    draw();

    // Return cleanup function
    return () => {
        cancelAnimationFrame(animationFrame);
        window.removeEventListener('resize', resize);
        canvas.remove();
    };
}

export function startVerification() {
    if (isVerified) {
        addToHistory("Already verified!");
        return;
    }
    addToHistory("Type <b>'guest'</b> for guest access (3 queries/day), or enter your access phrase for higher access.", false, false, true);
    updateInputState(true, "Enter 'guest' or your access phrase...");
    inputElement.value = '';
    inputElement.onkeypress = (event) => {
        if (event.key === 'Enter') {
            const input = inputElement.value.trim();
            if (!input) return;
            inputElement.value = '';
            const result = verifyAccess(input);
            if (result.level) {
                addToHistory(result.message, false, false, true);
                accessLevel = result.level;
                isVerified = true;
                updateInputState(true, "Enter a command...");
                const verifyBtn = terminalWrapper.querySelector('#verify-btn');
                if (verifyBtn) verifyBtn.style.display = 'none';
                // Switch input handler to command mode
                inputElement.onkeypress = (event) => {
                    if (event.key === 'Enter') {
                        const cmd = inputElement.value.trim();
                        if (!cmd) return;
                        inputElement.value = '';
                        handleCommand(cmd);
                    }
                };
            } else {
                addToHistory("Incorrect phrase. Try again.", false, true, true);
            }
        }
    };
    inputElement.disabled = false;
    inputElement.focus();
}

async function handleCommand(command) {
    const cmd = command.trim();

    // Help command
    if (cmd.toLowerCase() === 'help') {
        addToHistory(
            `Available commands:<br>
            <b>help</b> - Show this help<br>
            <b>status</b> - Show system status<br>
            <b>truth query [your question]</b> - Ask a legal/justice question<br>
            <b>matrix color [hex]</b> - Change Matrix rain color (e.g. matrix color #a259f7)<br>
            <b>clear</b> - Clear the terminal<br>
            <b>exit</b> - Hide the terminal`,
            false, false, true
        );
        return;
    }

    // Status command
    if (cmd.toLowerCase() === 'status') {
        addToHistory(
            `Status: Verified as <b>${accessLevel}</b>. Ready for queries.`,
            false, false, true
        );
        return;
    }

    // Clear command
    if (cmd.toLowerCase() === 'clear') {
        terminalHistory.innerHTML = '';
        return;
    }

    // Exit/hide command
    if (cmd.toLowerCase() === 'exit') {
        hide();
        return;
    }

    // Matrix color change
    if (cmd.toLowerCase().startsWith('matrix color ')) {
        const color = cmd.split(' ')[2];
        if (/^#[0-9a-f]{3,6}$/i.test(color)) {
            setMatrixRainColor(color);
            addToHistory(`Matrix rain color changed to <span style="color:${color}">${color}</span>.`, false, false, true);
        } else {
            addToHistory("Invalid color. Use a hex code like #a259f7.", false, true, true);
        }
        return;
    }

    // Truth query
    if (cmd.toLowerCase().startsWith('truth query ')) {
        const query = cmd.slice('truth query '.length).trim();
        if (!query) {
            addToHistory("Usage: truth query [your question]", false, true, true);
            return;
        }
        addToHistory(`Querying: ${query}`, true, false, true);
        executeQuery(query, {
            onComplete: (fullResponse, { isDone, citations }) => {
                addToHistory(fullResponse, false, false, true);
                if (citations && citations.length > 0) {
                    addToHistory("Sources: " + citations.map(c => `<a href="${c.url}" target="_blank">${c.title}</a>`).join(', '), false, false, true);
                }
            },
            onError: (err) => {
                addToHistory("Error: " + err, false, true, true);
            }
        });
        return;
    }

    // Default: treat as a query
    if (cmd.length > 0) {
        addToHistory(`Querying: ${cmd}`, true, false, true);
        executeQuery(cmd, {
            onComplete: (fullResponse, { isDone, citations }) => {
                addToHistory(fullResponse, false, false, true);
                if (citations && citations.length > 0) {
                    addToHistory("Sources: " + citations.map(c => `<a href="${c.url}" target="_blank">${c.title}</a>`).join(', '), false, false, true);
                }
            },
            onError: (err) => {
                addToHistory("Error: " + err, false, true, true);
            }
        });
        return;
    }

    addToHistory(`Unknown command: ${command}`, false, true, true);
}



