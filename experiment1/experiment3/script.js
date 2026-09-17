/*
 * Campus Connect – Experiment 3
 * script.js  – All client-side JavaScript in a separate file
 *
 * Events demonstrated:
 *  1. click    → theme toggle (dark / light mode)
 *  2. click    → update greeting text
 *  3. input    → live preview of name as user types
 *  4. keydown  → add task on Enter key press
 *  5. input    → real-time character counter in task input
 *  6. click    → add task via button
 *  7. click    → remove a task item (event delegation)
 *  8. change   → mark task as done via checkbox
 *  9. click    → change accent colour via swatches
 * 10. click    → clear the event log
 */

/* ─────────────────────────────────────────────
   1. DOM SELECTION  – select all needed elements
   ───────────────────────────────────────────── */
const body = document.body;
const btnTheme = document.getElementById('btn-theme');
const inputName = document.getElementById('input-name');
const previewName = document.getElementById('preview-name');
const btnGreet = document.getElementById('btn-greet');
const greetHeading = document.getElementById('greeting-heading');
const inputTask = document.getElementById('input-task');
const charCount = document.getElementById('char-count');
const btnAddTask = document.getElementById('btn-add-task');
const taskList = document.getElementById('task-list');
const taskCounter = document.getElementById('task-counter');
const emptyMsg = document.getElementById('empty-msg');
const swatchGroup = document.getElementById('swatches');
const colourName = document.getElementById('colour-name');
const eventLog = document.getElementById('event-log');
const btnClearLog = document.getElementById('btn-clear-log');

/* ─────────────────────────────────────────────
   2. UTILITY: LOG AN EVENT
   ───────────────────────────────────────────── */
const COLOUR_LABELS = {
    '#f5a623': 'Gold',
    '#3b82f6': 'Blue',
    '#10b981': 'Green',
    '#ef4444': 'Red',
    '#8b5cf6': 'Purple'
};

function logEvent(eventType, detail) {
    const now = new Date();
    const time = now.toLocaleTimeString('en-GB', { hour12: false });

    const entry = document.createElement('li');
    entry.classList.add('log-entry');
    entry.innerHTML =
        `<span class="log-time">[${time}]</span>` +
        `<span class="log-event">${eventType}</span>` +
        `<span class="log-detail">${detail}</span>`;

    // Prepend so newest is at top
    eventLog.insertBefore(entry, eventLog.firstChild);
}

/* ─────────────────────────────────────────────
   3. UTILITY: UPDATE TASK COUNTER (with bounce)
   ───────────────────────────────────────────── */
function updateCounter() {
    const count = taskList.querySelectorAll('.task-item').length;
    taskCounter.textContent = count;

    // Bounce animation: add class, remove after animation ends
    taskCounter.classList.add('bump');
    setTimeout(() => taskCounter.classList.remove('bump'), 220);

    // Show/hide empty message
    emptyMsg.style.display = count === 0 ? 'block' : 'none';
}

/* ─────────────────────────────────────────────
   4. UTILITY: ADD A TASK TO THE LIST
   ───────────────────────────────────────────── */
function addTask(text) {
    text = text.trim();
    if (!text) return;

    // Create task item elements
    const li = document.createElement('li');
    const checkbox = document.createElement('input');
    const span = document.createElement('span');
    const doneTag = document.createElement('span');
    const rmBtn = document.createElement('button');

    li.classList.add('task-item');

    checkbox.type = 'checkbox';
    checkbox.classList.add('task-checkbox');
    checkbox.setAttribute('aria-label', 'Mark task as done');

    span.classList.add('task-text');
    span.textContent = text;

    doneTag.classList.add('task-done-tag');
    doneTag.textContent = '✓ Done';

    rmBtn.classList.add('task-remove');
    rmBtn.setAttribute('aria-label', 'Remove task');
    rmBtn.textContent = '✕';

    // EVENT 8 – change: mark task done via checkbox
    checkbox.addEventListener('change', function () {
        if (this.checked) {
            li.classList.add('done');
            logEvent('change', `Marked as done → "${text}"`);
        } else {
            li.classList.remove('done');
            logEvent('change', `Unmarked → "${text}"`);
        }
    });

    li.append(checkbox, span, doneTag, rmBtn);
    taskList.appendChild(li);

    updateCounter();
    inputTask.value = '';
    charCount.textContent = '0 / 80';
    charCount.classList.remove('warn');
    inputTask.focus();

    logEvent('click / keydown', `Task added → "${text}"`);
}

/* ─────────────────────────────────────────────
   5. INITIALISE STARTER TASKS ON PAGE LOAD
   ───────────────────────────────────────────── */
const starterTasks = [
    'Review HTML5 semantic elements',
    'Study CSS Flexbox and Grid layouts',
    'Complete Experiment 3 – JavaScript DOM'
];
starterTasks.forEach(t => addTask(t));
logEvent('DOMContentLoaded', 'Page loaded – starter tasks inserted');

/* ─────────────────────────────────────────────
   6. EVENT LISTENERS
   ───────────────────────────────────────────── */

// EVENT 1 – click: toggle dark / light mode
btnTheme.addEventListener('click', function () {
    const isDark = body.classList.toggle('dark-mode');
    body.classList.toggle('light-mode', !isDark);
    btnTheme.textContent = isDark ? '☀️ Light Mode' : '🌙 Dark Mode';
    logEvent('click', `Theme toggled → ${isDark ? 'Dark' : 'Light'} mode`);
});

// EVENT 3 – input: live name preview as user types
inputName.addEventListener('input', function () {
    const value = this.value.trim();
    previewName.textContent = value || 'Student';
    logEvent('input', `Name preview → "${previewName.textContent}"`);
});

// EVENT 2 – click: update greeting heading
btnGreet.addEventListener('click', function () {
    const name = inputName.value.trim() || 'Student';
    greetHeading.textContent = `Hello, ${name}!`;
    logEvent('click', `Greeting updated → "Hello, ${name}!"`);
});

// EVENT 5 – input: real-time character counter
inputTask.addEventListener('input', function () {
    const len = this.value.length;
    charCount.textContent = `${len} / 80`;
    charCount.classList.toggle('warn', len >= 70);
    logEvent('input', `Task input → ${len} characters typed`);
});

// EVENT 4 – keydown: add task on Enter key
inputTask.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        logEvent('keydown', `Enter pressed – adding task`);
        addTask(this.value);
    }
});

// EVENT 6 – click: add task via button
btnAddTask.addEventListener('click', function () {
    addTask(inputTask.value);
});

// EVENT 7 – click: remove task (event delegation on list)
taskList.addEventListener('click', function (e) {
    if (!e.target.classList.contains('task-remove')) return;

    const li = e.target.closest('.task-item');
    const text = li.querySelector('.task-text').textContent;

    // Animate out, then remove from DOM
    li.classList.add('removing');
    li.addEventListener('transitionend', function onEnd() {
        li.removeEventListener('transitionend', onEnd);
        li.remove();
        updateCounter();
    });

    logEvent('click', `Task removed → "${text}"`);
});

// EVENT 9 – click: change accent colour via swatches
swatchGroup.addEventListener('click', function (e) {
    const swatch = e.target.closest('.swatch');
    if (!swatch) return;

    const colour = swatch.dataset.color;
    const label = COLOUR_LABELS[colour] || colour;

    // Update CSS custom property on :root
    document.documentElement.style.setProperty('--accent', colour);

    // Mark active swatch
    document.querySelectorAll('.swatch').forEach(s => s.classList.remove('active'));
    swatch.classList.add('active');

    // Update feedback text
    colourName.textContent = `${label} (${colour})`;

    logEvent('click', `Accent colour changed → ${label} ${colour}`);
});

// EVENT 10 – click: clear event log
btnClearLog.addEventListener('click', function () {
    while (eventLog.firstChild) eventLog.removeChild(eventLog.firstChild);
    logEvent('click', 'Event log cleared');
});
