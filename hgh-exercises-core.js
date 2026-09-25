/* ============================================================
   hgh-exercises-core.js  —  Reusable Exercise Logic
   ============================================================
   This file contains all the shared JavaScript needed by every
   exercise page. It handles:
     • user authentication checks
     • toggling answer visibility
     • building histograms (Type 3)
     • drawing timelines on canvas (Type 6)
     • the print modal (open, close, print with/without answers)

   Each function is documented with JSDoc. To use this file,
   simply include it AFTER your CSS and translation scripts,
   and BEFORE the page‑specific inline <script> that defines
   translations and config objects.
*/

/**
 * Checks whether the user is currently authenticated via Supabase.
 *
 * @returns {Promise<boolean>} True if a valid session exists, false otherwise.
 *
 * @description
 * This function relies on the global `window.__profileSupabase` object
 * being initialised (by ED-general-auth.js or similar). If the Supabase
 * client is not available, it returns false immediately.
 * It is used by all answer‑toggle functions to enforce that only
 * signed‑in users can see the answer.
 */
async function isUserRegistered() {
  if (!window.__profileSupabase) return false;
  try {
    const { data: { session } } = await window.__profileSupabase.auth.getSession();
    return !!session;
  } catch (e) {
    return false;
  }
}

/**
 * Generic answer toggle – used by exercise Types 1, 2, 4, and 5.
 *
 * @param {string} answerId  – The HTML id of the answer container (e.g., "ex1answer").
 * @param {HTMLElement} button – The button that was clicked (not used except for consistency).
 *
 * @returns {Promise<void>}
 *
 * @description
 * - If the answer is already visible, it hides it (removes the 'visible' class).
 * - If it is hidden, it first checks whether the user is signed in
 *   (via `isUserRegistered()`).
 * - If not signed in, an alert is shown (using the i18n key "alertNotSigned").
 * - Otherwise, it adds the 'visible' class, which triggers the CSS fade‑in
 *   animation and makes the answer visible.
 *
 * @example
 * // In the HTML button:
 * onclick="hghExercicesToggleAnswer('ex1answer', this)"
 */
async function hghExercicesToggleAnswer(answerId, button) {
  const answerDiv = document.getElementById(answerId);
  if (!answerDiv) return;

  if (answerDiv.classList.contains('visible')) {
    answerDiv.classList.remove('visible');
    return;
  }

  const registered = await isUserRegistered();
  if (!registered) {
    const t = window.t || (k => k);
    alert(t('alertNotSigned') || 'You must sign in to view answers.');
    return;
  }

  answerDiv.classList.add('visible');
}

/**
 * Builds a bar chart (histogram) inside a given container.
 * Used exclusively for Type 3 exercises.
 *
 * @param {Object} options – Configuration object.
 * @param {string} options.containerId – ID of the empty <div> to fill.
 * @param {string} options.title       – i18n key or literal text for the chart title.
 * @param {Array<{label: string, value: number, labelKey?: string, valueFormatted?: string}>} options.data
 *   – Array of data points. Each must have a numeric `value`. `label` is a fallback;
 *     if `labelKey` is provided, the translated text is used. `valueFormatted`
 *     allows a custom display string (e.g., "50" instead of the raw number).
 * @param {number} options.maxValue     – The value that corresponds to a full‑height bar (200px).
 * @param {Array<number>} options.ySteps – Values to display on the Y‑axis (top to bottom).
 * @param {string} [options.source]     – i18n key or text for the data source line.
 * @param {string} [options.scale]      – i18n key or text for the scale description.
 * @param {string} [options.keyLabel]   – i18n key or text for the legend label ("Key:").
 *
 * @returns {void}
 *
 * @description
 * This function creates all DOM elements for the histogram:
 *   - a title
 *   - a Y‑axis with the given `ySteps`
 *   - one bar per data entry, with colour classes `...--data1`, `...--data2`, etc.
 *   - optional source, scale, and legend sections.
 * All text is passed through the global translation function `t()` (or falls back
 * to the raw string if `t()` is not available).
 *
 * CSS classes are already defined in `hgh-exercices.css` and provide colours
 * for up to 8 different data sets.
 *
 * @example
 * hghExercicesType3BuildHistogram({
 *   containerId: 'ex3chartContainer',
 *   title: 'ex3A_title',
 *   data: [
 *     { label: 'USA', value: 50, labelKey: 'ex3A_key_usa', valueFormatted: '50' }
 *   ],
 *   maxValue: 50,
 *   ySteps: [50,40,30,20,10,0],
 *   source: 'ex3A_source',
 *   scale: 'ex3A_scale',
 *   keyLabel: 'ex3A_key_label'
 * });
 */
function hghExercicesType3BuildHistogram(options) {
  const container = document.getElementById(options.containerId);
  if (!container) return;
  const t = window.t || (k => k);

  container.innerHTML = '';

  // Title
  const titleEl = document.createElement('h4');
  titleEl.className = 'hgh-exercices-type3-tabToHistogram-chart-title';
  titleEl.textContent = t(options.title);
  container.appendChild(titleEl);

  // Chart
  const chartDiv = document.createElement('div');
  chartDiv.className = 'hgh-exercices-type3-tabToHistogram-chart';

  // Y-axis
  const yAxis = document.createElement('div');
  yAxis.className = 'hgh-exercices-type3-tabToHistogram-y-axis';
  options.ySteps.forEach(val => {
    const span = document.createElement('span');
    span.textContent = val;
    yAxis.appendChild(span);
  });
  chartDiv.appendChild(yAxis);

  // Bars
  const maxBarHeight = 200;
  options.data.forEach((item, index) => {
    const col = document.createElement('div');
    col.className = 'hgh-exercices-type3-tabToHistogram-col';

    const valSpan = document.createElement('span');
    valSpan.className = 'hgh-exercices-type3-tabToHistogram-col-value';
    valSpan.textContent = item.valueFormatted !== undefined ? item.valueFormatted : item.value;
    col.appendChild(valSpan);

    const bar = document.createElement('div');
    const heightPx = Math.round((item.value / options.maxValue) * maxBarHeight);
    bar.className = 'hgh-exercices-type3-tabToHistogram-bar';
    bar.classList.add('hgh-exercices-type3-tabToHistogram-bar--data' + (index + 1));
    bar.style.height = heightPx + 'px';
    col.appendChild(bar);

    const labelSpan = document.createElement('span');
    labelSpan.className = 'hgh-exercices-type3-tabToHistogram-col-name';
    labelSpan.textContent = item.labelKey ? t(item.labelKey) : item.label;
    col.appendChild(labelSpan);

    chartDiv.appendChild(col);
  });
  container.appendChild(chartDiv);

  // Source
  if (options.source) {
    const src = document.createElement('p');
    src.className = 'hgh-exercices-type3-tabToHistogram-source';
    src.textContent = t(options.source);
    container.appendChild(src);
  }

  // Scale
  if (options.scale) {
    const scale = document.createElement('p');
    scale.className = 'hgh-exercices-type3-tabToHistogram-scale';
    scale.textContent = t(options.scale);
    container.appendChild(scale);
  }

  // Legend
  if (options.keyLabel) {
    const keyDiv = document.createElement('div');
    keyDiv.className = 'hgh-exercices-type3-tabToHistogram-key';
    const keyLabelSpan = document.createElement('span');
    keyLabelSpan.className = 'hgh-exercices-type3-tabToHistogram-key-label';
    keyLabelSpan.textContent = t(options.keyLabel);
    keyDiv.appendChild(keyLabelSpan);

    options.data.forEach((item, index) => {
      const wrapper = document.createElement('span');
      const swatch = document.createElement('span');
      swatch.className = 'hgh-exercices-type3-tabToHistogram-swatch hgh-exercices-type3-tabToHistogram-swatch--data' + (index + 1);
      wrapper.appendChild(swatch);
      const textSpan = document.createElement('span');
      textSpan.textContent = item.labelKey ? t(item.labelKey) : item.label;
      wrapper.appendChild(textSpan);
      keyDiv.appendChild(wrapper);
    });
    container.appendChild(keyDiv);
  }
}

/**
 * Auth‑protected toggle for Type‑3 exercises (table → histogram).
 * Shows the answer and builds the histogram the first time it is opened.
 *
 * @param {HTMLElement} button        – The clicked button.
 * @param {string} answerId           – ID of the answer container (e.g., "ex3answer").
 * @param {string} containerId        – ID of the empty div where the histogram will be injected.
 * @param {Object} chartOptions       – The configuration object for `hghExercicesType3BuildHistogram`.
 *
 * @returns {Promise<void>}
 *
 * @description
 * 1. If the answer is already visible, it hides it.
 * 2. If hidden, it checks that the user is signed in (otherwise alerts).
 * 3. It adds the 'visible' class to the answer container.
 * 4. On the first call, it builds the histogram by calling
 *    `hghExercicesType3BuildHistogram({ containerId, ...chartOptions })`.
 *    Subsequent toggles do not rebuild.
 *
 * @example
 * // In the HTML button:
 * onclick="hghExercicesType3ToggleAnswer(this, 'ex3answer', 'ex3chartContainer', ex3ChartOptions)"
 */
async function hghExercicesType3ToggleAnswer(button, answerId, containerId, chartOptions) {
  const answerDiv = document.getElementById(answerId);
  if (!answerDiv) return;

  if (answerDiv.classList.contains('visible')) {
    answerDiv.classList.remove('visible');
    return;
  }

  const registered = await isUserRegistered();
  if (!registered) {
    const t = window.t || (k => k);
    alert(t('alertNotSigned') || 'You must sign in to view answers.');
    return;
  }

  answerDiv.classList.add('visible');

  // Build histogram only once
  // Build histogram only once
  if (!document.getElementById(containerId).hasChildNodes()) {
    hghExercicesType3BuildHistogram({ containerId, ...chartOptions });
  }

  // Remember the config so printing can build it later if needed
  answerDiv.__chartConfig = { containerId, ...chartOptions };
}

/**
 * Draws a modular timeline onto a <canvas> element.
 * Used exclusively for Type 6 exercises.
 *
 * @param {Object} config – Configuration object.
 * @param {string} config.containerId   – ID of the <canvas> element.
 * @param {string} config.titleKey      – i18n key for the timeline title.
 * @param {Array<{year: number, labelKey: string, subKey: string}>} config.events
 *   – The events to place on the timeline. Each must have a year and two i18n keys
 *     (for the main label and the sub‑label).
 * @param {number} config.startYear     – Earliest year on the timeline.
 * @param {number} config.endYear       – Latest year on the timeline.
 * @param {Array<number>} [config.scaleYears] – Not used directly; kept for compatibility.
 * @param {boolean} [config.forceWhiteBg]    – If true, the background is forced to white
 *   (useful for print). Otherwise it reads the current theme's surface colour.
 *
 * @returns {void}
 *
 * @description
 * This function:
 *   - Handles high‑DPI displays (devicePixelRatio).
 *   - Automatically detects RTL direction and mirrors the layout if needed.
 *   - Draws a horizontal arrow (the time axis), event ticks, angled labels,
 *     and a scale bar with a "years" label.
 *   - All colours are taken from the current CSS custom properties (theme),
 *     unless `forceWhiteBg` is true (for printing).
 *   - If the canvas has zero size (e.g., hidden ancestor), it retries on the
 *     next animation frame.
 *
 * @example
 * hghExercicesType6DrawTimeline({
 *   containerId: 'ex6timelineCanvas',
 *   titleKey: 'ex6_timeline_title',
 *   events: [
 *     { year: 1945, labelKey: 'ex6_event_yalta_label', subKey: 'ex6_event_yalta_sub' }
 *   ],
 *   startYear: 1945,
 *   endYear: 1962
 * });
 */
function hghExercicesType6DrawTimeline(config) {
  const canvas = document.getElementById(config.containerId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const t = window.t || ((k) => k);

  // Prepare canvas for high DPI
  const rect = canvas.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) {
    requestAnimationFrame(() => hghExercicesType6DrawTimeline(config));
    return;
  }
  const dpr = window.devicePixelRatio || 1;
  const displayWidth = rect.width;
  const displayHeight = rect.height || 320;
  if (canvas.width !== displayWidth * dpr || canvas.height !== displayHeight * dpr) {
    canvas.width = displayWidth * dpr;
    canvas.height = displayHeight * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = displayWidth + 'px';
    canvas.style.height = displayHeight + 'px';
  }
  ctx.clearRect(0, 0, displayWidth, displayHeight);

  // Theme colours
  const style = getComputedStyle(document.documentElement);
  const textColor = style.getPropertyValue('--ED-General-color-text-primary').trim() || '#1e293b';
  const secondaryColor = style.getPropertyValue('--ED-General-color-text-secondary').trim() || '#5a6c7d';
  const accentColor = style.getPropertyValue('--ED-General-color-accent-default').trim() || '#4a7fd9';
  const bgColor = config.forceWhiteBg ? '#ffffff'
      : (style.getPropertyValue('--ED-General-color-surface').trim() || '#ffffff');

  const isRTL = getComputedStyle(document.documentElement).direction === 'rtl';

  const margin = { top: 60, right: 60, bottom: 90, left: 60 };
  const arrowY = margin.top + 20;
  const arrowThickness = 30;
  const arrowHeadLength = 30;
  const arrowHeadHalfWidth = 30;
  const tickSize = 8;

  let shaftStartX = margin.left;
  let shaftEndX = displayWidth - margin.right - arrowHeadLength;
  if (isRTL) {
    shaftStartX = displayWidth - margin.right;
    shaftEndX = margin.left + arrowHeadLength;
  }
  const totalShaftWidth = Math.abs(shaftEndX - shaftStartX);
  const yearSpan = config.endYear - config.startYear;

  // Background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, displayWidth, displayHeight);

  // Arrow shaft
  ctx.beginPath();
  ctx.moveTo(shaftStartX, arrowY);
  ctx.lineTo(shaftEndX, arrowY);
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = arrowThickness;
  ctx.stroke();

  // Arrowhead
  const headTipX = isRTL ? shaftEndX - arrowHeadLength : shaftEndX + arrowHeadLength;
  const headBaseX = shaftEndX;
  ctx.beginPath();
  ctx.moveTo(headTipX, arrowY);
  ctx.lineTo(headBaseX, arrowY - arrowHeadHalfWidth);
  ctx.lineTo(headBaseX, arrowY + arrowHeadHalfWidth);
  ctx.closePath();
  ctx.fillStyle = accentColor;
  ctx.fill();

  // Events
  const events = config.events;
  events.forEach(ev => {
    const ratio = (ev.year - config.startYear) / yearSpan;
    const x = isRTL ? (shaftStartX - ratio * totalShaftWidth) : (shaftStartX + ratio * totalShaftWidth);

    ctx.beginPath();
    ctx.moveTo(x, arrowY - tickSize);
    ctx.lineTo(x, arrowY + tickSize);
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x, arrowY, 5, 0, 2 * Math.PI);
    ctx.fillStyle = accentColor;
    ctx.fill();

    const fontSizeYear = Math.max(11, 12 * displayWidth / 850);
    ctx.font = `bold ${fontSizeYear}px var(--ED-General-font-stack, sans-serif)`;
    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    ctx.fillText(ev.year, x, arrowY - tickSize - 6);

    ctx.save();
    ctx.translate(x, arrowY - tickSize - 18);
    const angle = isRTL ? 0.35 : -0.35;
    ctx.rotate(angle);
    const fontSizeLabel = Math.max(9, 10 * displayWidth / 850);
    ctx.font = `${fontSizeLabel}px var(--ED-General-font-stack, sans-serif)`;
    ctx.fillStyle = secondaryColor;
    ctx.textAlign = isRTL ? 'left' : 'right';
    ctx.fillText(t(ev.labelKey), 0, 0);
    ctx.restore();

    const fontSizeSub = Math.max(8, 9 * displayWidth / 850);
    ctx.font = `${fontSizeSub}px var(--ED-General-font-stack, sans-serif)`;
    ctx.fillStyle = secondaryColor;
    ctx.textAlign = 'center';
    ctx.fillText(t(ev.subKey), x, arrowY + tickSize + 14);
  });

  // Scale bar
  let bestYears = 5;
  for (const years of [1, 2, 5, 10, 20, 50]) {
    const pix = (years / yearSpan) * totalShaftWidth;
    if (pix >= 60 && pix <= 160) {
      bestYears = years;
      break;
    }
  }
  const barWidth = (bestYears / yearSpan) * totalShaftWidth;
  const scaleY = arrowY + 65;
  const scaleBarHeight = 4;
  const scaleTickHeight = 8;
  let scaleStartX = shaftStartX;
  let scaleEndX = isRTL ? shaftStartX - barWidth : shaftStartX + barWidth;

  ctx.fillStyle = secondaryColor;
  ctx.fillRect(scaleStartX, scaleY - scaleBarHeight / 2, barWidth, scaleBarHeight);

  ctx.beginPath();
  ctx.moveTo(scaleStartX, scaleY - scaleTickHeight / 2);
  ctx.lineTo(scaleStartX, scaleY + scaleTickHeight / 2);
  ctx.moveTo(scaleEndX, scaleY - scaleTickHeight / 2);
  ctx.lineTo(scaleEndX, scaleY + scaleTickHeight / 2);
  ctx.strokeStyle = secondaryColor;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  const fontSizeScale = Math.max(9, 10 * displayWidth / 850);
  ctx.font = `${fontSizeScale}px var(--ED-General-font-stack, sans-serif)`;
  ctx.fillStyle = secondaryColor;
  ctx.textAlign = 'center';
  ctx.fillText('0', scaleStartX, scaleY - 10);
  ctx.fillText(bestYears + ' ' + t('years'), scaleEndX, scaleY - 10);

  const scaleLabelX = isRTL ? scaleEndX - 40 : scaleStartX - 40;
  ctx.font = `italic ${fontSizeScale}px var(--ED-General-font-stack, sans-serif)`;
  ctx.textAlign = isRTL ? 'left' : 'right';
  ctx.fillText(t('scale') + ':', scaleLabelX, scaleY + 4);

  // Title
  const fontSizeTitle = Math.max(14, 16 * displayWidth / 850);
  ctx.font = `bold ${fontSizeTitle}px var(--ED-General-font-stack, sans-serif)`;
  ctx.fillStyle = textColor;
  ctx.textAlign = 'center';
  ctx.fillText(t(config.titleKey), displayWidth / 2, margin.top - 30);
}

/**
 * Auth‑protected toggle for Type‑6 exercises (timeline).
 * Shows the answer and draws the canvas timeline the first time.
 *
 * @param {HTMLElement} button          – The clicked button.
 * @param {string} answerId             – ID of the answer container (e.g., "ex6answer").
 * @param {string} canvasId             – ID of the <canvas> element.
 * @param {Object} timelineConfig       – The configuration object for `hghExercicesType6DrawTimeline`.
 *
 * @returns {Promise<void>}
 *
 * @description
 * Works similarly to the Type‑3 toggle:
 *   - Hides the answer if already visible.
 *   - Checks authentication, then shows the answer.
 *   - Draws the timeline on the canvas only once (uses a private `__timelineDrawn`
 *     property on the canvas to avoid redraws).
 *
 * @example
 * // In the HTML button:
 * onclick="hghExercicesType6ToggleAnswer(this, 'ex6answer', 'ex6timelineCanvas', ex6TimelineOptions)"
 */
async function hghExercicesType6ToggleAnswer(button, answerId, canvasId, timelineConfig) {
  const answerDiv = document.getElementById(answerId);
  if (!answerDiv) return;

  if (answerDiv.classList.contains('visible')) {
    answerDiv.classList.remove('visible');
    return;
  }

  const registered = await isUserRegistered();
  if (!registered) {
    const t = window.t || (k => k);
    alert(t('alertNotSigned') || 'You must sign in to view answers.');
    return;
  }

  answerDiv.classList.add('visible');

    const canvas = document.getElementById(canvasId);
  if (canvas && !canvas.__timelineDrawn) {
    hghExercicesType6DrawTimeline({ containerId: canvasId, ...timelineConfig });
    canvas.__timelineDrawn = true;
  }

  // Remember the config so printing can draw it later if needed
  answerDiv.__timelineConfig = { containerId: canvasId, ...timelineConfig };
}

/* ──────────────────────────────────────────────
   Print Modal Logic
   ────────────────────────────────────────────── */

/** @type {HTMLElement|null} The print modal overlay element (hidden by default). */
let printModal;
/** @type {HTMLButtonElement|null} The "Print" confirm button inside the modal. */
let confirmBtn;
/** @type {HTMLButtonElement|null} The "Cancel" button inside the modal. */
let cancelBtn;
/** @type {HTMLInputElement|null} The radio input for "Questions Only". */
let radioQuestionsOnly;
/** @type {HTMLInputElement|null} The radio input for "Questions with Answers". */
let radioWithAnswers;
/** @type {HTMLElement|null} The warning message shown when the user is not signed in. */
let authWarning;

/**
 * Initialises the print modal after the DOM is fully loaded.
 * Attaches event listeners and exposes `hghExercicesOpenPrintModal()` globally.
 *
 * @listens DOMContentLoaded
 */
document.addEventListener('DOMContentLoaded', function() {
  printModal = document.getElementById('print-modal');
  confirmBtn = document.getElementById('print-modal-confirm');
  cancelBtn = document.getElementById('print-modal-cancel');
  radioQuestionsOnly = document.querySelector('input[name="printOption"][value="questions-only"]');
  radioWithAnswers = document.querySelector('input[name="printOption"][value="with-answers"]');
  authWarning = document.getElementById('auth-warning');
  const optionWithAnswersLabel = document.getElementById('option-with-answers');

  if (confirmBtn) confirmBtn.addEventListener('click', hghExercicesHandlePrintWithOptions);
  if (cancelBtn) cancelBtn.addEventListener('click', hghExercicesClosePrintModal);
  if (printModal) {
    printModal.addEventListener('click', function(e) {
      if (e.target === printModal) hghExercicesClosePrintModal();
    });
  }
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && printModal && printModal.style.display === 'flex') {
      hghExercicesClosePrintModal();
    }
  });

  /**
   * Opens the print modal.
   *
   * @global
   * @function hghExercicesOpenPrintModal
   * @returns {Promise<void>}
   *
   * @description
   * Resets the radio buttons to "Questions Only" and disables the "with answers"
   * option (plus shows a warning) if the user is not signed in.
   * Called directly from the Print button in the page.
   */
  window.hghExercicesOpenPrintModal = async function() {
    if (!printModal) return;
    const registered = await isUserRegistered();
    if (radioQuestionsOnly) radioQuestionsOnly.checked = true;
    if (radioWithAnswers) radioWithAnswers.checked = false;
    const t = window.t || (k => k);
    if (registered) {
      optionWithAnswersLabel.classList.remove('disabled-option');
      authWarning.style.display = 'none';
    } else {
      optionWithAnswersLabel.classList.add('disabled-option');
      authWarning.style.display = 'block';
      authWarning.textContent = '⚠️ ' + t('authWarningPrint');
    }
    printModal.style.display = 'flex';
    printModal.setAttribute('aria-hidden', 'false');
    setTimeout(() => { if (confirmBtn) confirmBtn.focus(); }, 100);
  };
});

/**
 * Closes the print modal (hides it and sets aria-hidden).
 *
 * @returns {void}
 */
function hghExercicesClosePrintModal() {
  if (printModal) {
    printModal.style.display = 'none';
    printModal.setAttribute('aria-hidden', 'true');
  }
}
/**
 * Prepare graphic answers (histograms and timelines) before printing.
 *
 * @param {boolean} printWithAnswers – true when printing answers.
 * @returns {void}
 *
 * This function:
 *   - Reads a global registry (window.__hghExerciseGraphicConfigs)
 *   - For chart entries, builds the histogram if the container is empty.
 *   - For timeline entries, draws the timeline canvas if it hasn't been drawn.
 *   - Uses `forceWhiteBg: true` for timeline drawing so it prints correctly.
 */
function hghExercicesPrepareGraphicAnswersForPrint(printWithAnswers) {
  if (!printWithAnswers) return;

  const registry = window.__hghExerciseGraphicConfigs || {};
  const allAnswers = document.querySelectorAll('[id$="answer"]');

  allAnswers.forEach(answer => {
    const cfg = registry[answer.id];
    if (!cfg) return;

    if (cfg.type === 'chart') {
      const container = document.getElementById(cfg.containerId);
      if (container && !container.hasChildNodes()) {
        hghExercicesType3BuildHistogram({
          containerId: cfg.containerId,
          ...cfg.chartOptions
        });
      }
    } else if (cfg.type === 'timeline') {
      const canvas = document.getElementById(cfg.containerId);
      if (canvas && !canvas.__timelineDrawn) {
        hghExercicesType6DrawTimeline({
          containerId: cfg.containerId,
          ...cfg.timelineConfig,
          forceWhiteBg: true
        });
        canvas.__timelineDrawn = true;
      }
    }
  });
}
/**
 * Handles the actual print action.
 *
 * @returns {Promise<void>}
 *
 * @description
 * 1. Reads which print option is selected.
 * 2. If "with answers" is selected but the user is not signed in, shows an alert.
 * 3. Saves the current visibility state of all answer containers.
 * 4. Either shows all answers (for "with answers") or hides them all (for "questions only").
 * 5. Closes the modal and triggers `window.print()`.
 * 6. After printing (via the `afterprint` event or a timeout fallback), restores the
 *    original visibility state.
 *
 * Note: This function does NOT automatically build the histogram or redraw the timeline
 * for printing. Those must be handled separately (e.g., by the page's print button logic
 * calling `hghExercicesType3BuildHistogram` or `hghExercicesType6DrawTimeline` before
 * printing, which can be added in the page‑specific print configuration if needed).
 */
async function hghExercicesHandlePrintWithOptions() {
  const printWithAnswers = radioWithAnswers ? radioWithAnswers.checked : false;
  const registered = await isUserRegistered();
  if (printWithAnswers && !registered) {
    const t = window.t || (k => k);
    alert(t('alertNotSigned') || 'You must sign in to print with answers.');
    return;
  }

  const allAnswers = document.querySelectorAll('[id$="answer"]');
  const previouslyVisible = new Set();
  allAnswers.forEach(a => { if (a.classList.contains('visible')) previouslyVisible.add(a.id); });

  if (printWithAnswers) {
    allAnswers.forEach(a => a.classList.add('visible'));
  } else {
    allAnswers.forEach(a => a.classList.remove('visible'));
  }

  hghExercicesClosePrintModal();

  setTimeout(() => {
    // Build/draw all graphic answers before calling window.print()
    hghExercicesPrepareGraphicAnswersForPrint(printWithAnswers);
    window.print();
    const restore = () => {
      allAnswers.forEach(a => {
        if (previouslyVisible.has(a.id)) a.classList.add('visible');
        else a.classList.remove('visible');
      });
      window.removeEventListener('afterprint', restore);
    };
    window.addEventListener('afterprint', restore);
    setTimeout(restore, 2000); // fallback
  }, 200);
}
/* ══════════════════════════════════════════════════════════
   Type 7 – Fill in the Blanks (interactive + auth-gated reveal)
   ══════════════════════════════════════════════════════════ */

/**
 * Selects a word chip in the word bank. Deselects all others in the same bank.
 *
 * @param {HTMLElement} wordEl – The word chip element that was clicked.
 */
function hghExercicesType7SelectWord(wordEl) {
  const bank = wordEl.closest('.hgh-exercices-type7-fillBlanks-wordbank');
  if (!bank) return;
  bank.querySelectorAll('.hgh-exercices-type7-fillBlanks-word').forEach(w => {
    if (w !== wordEl) w.classList.remove('selected');
  });
  wordEl.classList.toggle('selected');
}

/**
 * Fills (or clears) a blank slot with the currently selected word.
 *
 * @param {HTMLElement} blankEl – The blank span that was clicked.
 */
function hghExercicesType7FillBlank(blankEl) {
  const section = blankEl.closest('.hgh-exercices-type7-fillBlanks-section');
  if (!section) return;

  // Clicking a filled blank clears it
  if (blankEl.dataset.filledWith) {
    const prevKey = blankEl.dataset.filledWith;
    blankEl.textContent = '';
    blankEl.classList.remove('filled', 'correct', 'wrong');
    delete blankEl.dataset.filledWith;
    // free the word back in the bank
    section.querySelectorAll('.hgh-exercices-type7-fillBlanks-word').forEach(w => {
      if ((w.dataset.key || w.textContent.trim()) === prevKey) {
        w.classList.remove('used');
      }
    });
    return;
  }

  // Otherwise, fill with the currently selected word
  const selected = section.querySelector('.hgh-exercices-type7-fillBlanks-word.selected');
  if (!selected) return;
  const key = selected.dataset.key || selected.textContent.trim();
  blankEl.textContent = selected.textContent.trim();
  blankEl.classList.add('filled');
  blankEl.dataset.filledWith = key;
  selected.classList.remove('selected');
  selected.classList.add('used');
}

/**
 * Auth-gated toggle that reveals the correct answers for Type 7.
 * After reveal, adds `.correct` / `.wrong` classes to each blank
 * (non-destructive; the user's text is preserved if it differs from the answer).
 *
 * @param {HTMLElement} button   – The clicked button.
 * @param {string} answerId      – ID of the answer container.
 * @returns {Promise<void>}
 */
async function hghExercicesType7ToggleAnswer(button, answerId) {
  const answerDiv = document.getElementById(answerId);
  if (!answerDiv) return;

  if (answerDiv.classList.contains('visible')) {
    answerDiv.classList.remove('visible');
    const section = answerDiv.closest('.hgh-exercices-type7-fillBlanks-section');
    if (section) {
      section.querySelectorAll('.hgh-exercices-type7-fillBlanks-blank').forEach(b => {
        b.classList.remove('correct', 'wrong');
      });
    }
    return;
  }

  const registered = await isUserRegistered();
  if (!registered) {
    const t = window.t || (k => k);
    alert(t('alertNotSigned') || 'You must sign in to view answers.');
    return;
  }

  answerDiv.classList.add('visible');

  const section = answerDiv.closest('.hgh-exercices-type7-fillBlanks-section');
  if (section) {
    section.querySelectorAll('.hgh-exercices-type7-fillBlanks-blank').forEach(b => {
      const correct = (b.dataset.correct || '').trim();
      const userVal = (b.dataset.filledWith || '').trim();
      b.classList.remove('correct', 'wrong');
      if (!userVal) return;                     // user left it empty → no marker
      if (userVal === correct) {
        b.classList.add('correct');
      } else {
        b.classList.add('wrong');
      }
    });
  }
}

/* ══════════════════════════════════════════════════════════
   Type 8 – Match Column A with Column B
   ══════════════════════════════════════════════════════════ */

/**
 * Handles selecting/matching items across two columns.
 * Each item must have `data-key` (its own id) and its parent column must
 * have `data-side="A"` or `data-side="B"`.
 *
 * @param {HTMLElement} itemEl – The item that was clicked.
 */
function hghExercicesType8SelectItem(itemEl) {
  const col = itemEl.closest('.hgh-exercices-type8-matchColumns-column');
  const section = itemEl.closest('.hgh-exercices-type8-matchColumns-section');
  if (!col || !section) return;
  const side = col.dataset.side;
  if (!side) return;

  // If item was already matched, ignore (or allow toggling off)
  if (itemEl.classList.contains('matched')) {
    itemEl.classList.remove('matched');
    itemEl.classList.remove('correct', 'wrong');
    delete itemEl.dataset.pairedWith;
    return;
  }

  // Toggle selection within the same side
  const sameSideSelected = section.querySelector(
    `.hgh-exercices-type8-matchColumns-column[data-side="${side}"] .hgh-exercices-type8-matchColumns-item.selected`
  );
  if (sameSideSelected === itemEl) {
    itemEl.classList.remove('selected');
    return;
  }
  section.querySelectorAll(
    `.hgh-exercices-type8-matchColumns-column[data-side="${side}"] .hgh-exercices-type8-matchColumns-item.selected`
  ).forEach(i => i.classList.remove('selected'));
  itemEl.classList.add('selected');

  // Check the other side
  const otherSide = side === 'A' ? 'B' : 'A';
  const otherSel = section.querySelector(
    `.hgh-exercices-type8-matchColumns-column[data-side="${otherSide}"] .hgh-exercices-type8-matchColumns-item.selected`
  );
  if (otherSel) {
    // Pair them
    itemEl.classList.remove('selected');
    otherSel.classList.remove('selected');
    itemEl.classList.add('matched');
    otherSel.classList.add('matched');
    itemEl.dataset.pairedWith = otherSel.dataset.key;
    otherSel.dataset.pairedWith = itemEl.dataset.key;
  }
}

/**
 * Auth-gated toggle that reveals the correct pairings for Type 8.
 * Correct pairings are indicated in the HTML via `data-match="<key>"` on each item.
 *
 * @param {HTMLElement} button   – The clicked button.
 * @param {string} answerId      – ID of the answer container.
 * @returns {Promise<void>}
 */
async function hghExercicesType8ToggleAnswer(button, answerId) {
  const answerDiv = document.getElementById(answerId);
  if (!answerDiv) return;

  if (answerDiv.classList.contains('visible')) {
    answerDiv.classList.remove('visible');
    const section = answerDiv.closest('.hgh-exercices-type8-matchColumns-section');
    if (section) {
      section.querySelectorAll('.hgh-exercices-type8-matchColumns-item').forEach(i => {
        i.classList.remove('correct', 'wrong');
      });
    }
    return;
  }

  const registered = await isUserRegistered();
  if (!registered) {
    const t = window.t || (k => k);
    alert(t('alertNotSigned') || 'You must sign in to view answers.');
    return;
  }

  answerDiv.classList.add('visible');

  const section = answerDiv.closest('.hgh-exercices-type8-matchColumns-section');
  if (!section) return;

  // Mark each item based on its data-match vs. the user's pairedWith
  section.querySelectorAll('.hgh-exercices-type8-matchColumns-item').forEach(i => {
    i.classList.remove('correct', 'wrong');
    const expected = i.dataset.match;
    const userPaired = i.dataset.pairedWith;
    if (!userPaired) return;
    if (userPaired === expected) {
      i.classList.add('correct');
    } else {
      i.classList.add('wrong');
    }
  });
}

/* ══════════════════════════════════════════════════════════
   Type 9 – Multiple Choice
   ══════════════════════════════════════════════════════════ */

/**
 * Selects a single MCQ option (radio-style).
 *
 * @param {HTMLElement} optionEl – The option element that was clicked.
 */
function hghExercicesType9SelectOption(optionEl) {
  const section = optionEl.closest('.hgh-exercices-type9-multipleChoice-section');
  if (!section) return;
  section.querySelectorAll('.hgh-exercices-type9-multipleChoice-option').forEach(o => {
    if (o !== optionEl) o.classList.remove('selected');
  });
  optionEl.classList.toggle('selected');
}

/**
 * Auth-gated toggle that reveals the correct option for Type 9.
 * The correct option is marked in the HTML via `data-correct="true"`.
 *
 * @param {HTMLElement} button   – The clicked button.
 * @param {string} answerId      – ID of the answer container.
 * @returns {Promise<void>}
 */
async function hghExercicesType9ToggleAnswer(button, answerId) {
  const answerDiv = document.getElementById(answerId);
  if (!answerDiv) return;

  if (answerDiv.classList.contains('visible')) {
    answerDiv.classList.remove('visible');
    const section = answerDiv.closest('.hgh-exercices-type9-multipleChoice-section');
    if (section) {
      section.querySelectorAll('.hgh-exercices-type9-multipleChoice-option').forEach(o => {
        o.classList.remove('correct', 'wrong');
      });
    }
    return;
  }

  const registered = await isUserRegistered();
  if (!registered) {
    const t = window.t || (k => k);
    alert(t('alertNotSigned') || 'You must sign in to view answers.');
    return;
  }

  answerDiv.classList.add('visible');

  const section = answerDiv.closest('.hgh-exercices-type9-multipleChoice-section');
  if (!section) return;

  section.querySelectorAll('.hgh-exercices-type9-multipleChoice-option').forEach(o => {
    o.classList.remove('correct', 'wrong');
    const isCorrect = o.dataset.correct === 'true';
    const wasSelected = o.classList.contains('selected');
    if (isCorrect) {
      o.classList.add('correct');
    } else if (wasSelected) {
      o.classList.add('wrong');
    }
  });
}