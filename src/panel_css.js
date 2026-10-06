// =========================
// Panel stylesheet
// =========================
const CSS_STYLE_ID = 'display_sensei_plugin_css';

const DS_PANEL_CSS = `
.display-sensei-body {
    --ds-accent: #2ba8ff;
    --ds-accent-strong: #007acc;
    --ds-primary-top: #4f95f7;
    --ds-primary-bottom: #3e7ad6;
    --ds-primary-hover-top: #5fa3ff;
    --ds-primary-hover-bottom: #4a88e8;
    --ds-primary-edge: rgba(255, 255, 255, 0.14);
    --ds-tab-active-top: #244763;
    --ds-tab-active-bottom: #1b3447;
    --ds-on-accent: #fff;
    --ds-outline: color-mix(in srgb, var(--color-text) 25%, var(--color-button));
    --ds-glow: 0 0 0 1px color-mix(in srgb, var(--ds-accent) 55%, transparent),
        0 0 10px color-mix(in srgb, var(--ds-accent-strong) 45%, transparent);
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    min-height: 0;
    overflow: hidden;
}
.display-sensei-body *,
.display-sensei-body *::before,
.display-sensei-body *::after {
    box-sizing: border-box;
}
.display-sensei-body p {
    margin: 0;
}

.display-sensei-body .ds-scroll {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-gutter: stable both-edges;
    display: flex;
    flex-direction: column;
    padding: 10px 2px 4px 2px;
}
.display-sensei-body .ds-footer {
    flex: 0 0 auto;
    overflow: hidden;
    scrollbar-gutter: stable both-edges;
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 8px 2px 10px 2px;
    border-top: 1px solid var(--color-border);
}

.display-sensei-body .ds-header {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: flex-start;
    gap: 8px;
    margin-bottom: 10px;
}
.display-sensei-body .ds-header-text {
    flex: 1 1 auto;
    min-width: 0;
}
.display-sensei-body .ds-title {
    margin: 2px 0 0 0;
    white-space: nowrap;
}
.display-sensei-body .ds-subtitle {
    margin-top: 2px;
    font-size: 12px;
    color: var(--color-subtle_text);
}

.display-sensei-body .ds-tip {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    width: 13px;
    height: 13px;
    margin-left: 4px;
    vertical-align: -2px;
    border: 1px solid var(--ds-outline);
    border-radius: 50%;
    color: var(--color-subtle_text);
    font-size: 9px;
    font-weight: 700;
    font-style: normal;
    line-height: 1;
    cursor: help;
    user-select: none;
}
.display-sensei-body .ds-tip::before {
    content: 'i';
}
.display-sensei-body .ds-tip:hover {
    border-color: var(--ds-accent);
    color: var(--color-text);
}
.display-sensei-body .ds-flex-row > .ds-tip,
.display-sensei-body .ds-view-caption-row > .ds-tip,
.display-sensei-body .ds-preset-note > .ds-tip {
    margin-left: 0;
}
.display-sensei-body .ds-preset-note {
    flex: 0 1 auto;
    display: inline-flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: flex-end;
    gap: 4px;
    min-width: 0;
}

.display-sensei-body select,
.display-sensei-body textarea,
.display-sensei-body input[type="number"] {
    width: 100%;
    height: 28px;
    padding: 4px 6px;
    font-size: 11px;
    line-height: 18px;
    border: 1px solid var(--color-border);
    border-radius: 3px;
    background: var(--color-back);
    color: var(--color-text);
    margin: 0;
}
.display-sensei-body textarea {
    height: auto;
    min-height: 28px;
    resize: vertical;
}
.display-sensei-body select {
    padding-right: 20px;
    background-image:
        linear-gradient(45deg, transparent 50%, var(--color-subtle_text) 50%),
        linear-gradient(135deg, var(--color-subtle_text) 50%, transparent 50%);
    background-position: calc(100% - 12px) 50%, calc(100% - 8px) 50%;
    background-size: 4px 4px, 4px 4px;
    background-repeat: no-repeat;
    text-overflow: ellipsis;
}
.display-sensei-body button {
    height: 28px;
    min-width: 0;
    padding: 4px 8px;
    font-size: 11px;
    line-height: 18px;
    border: 1px solid var(--color-border);
    border-radius: 3px;
    background: var(--color-back);
    color: var(--color-text);
    cursor: pointer;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.display-sensei-body button:hover:not(:disabled) {
    border-color: var(--ds-accent);
}
.display-sensei-body button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}
.display-sensei-body .ds-primary {
    border-color: var(--ds-primary-edge);
    background: linear-gradient(180deg, var(--ds-primary-top), var(--ds-primary-bottom));
    color: var(--ds-on-accent);
    font-weight: 600;
}
.display-sensei-body .ds-primary:hover:not(:disabled) {
    background: linear-gradient(180deg, var(--ds-primary-hover-top), var(--ds-primary-hover-bottom));
}
.display-sensei-body .ds-primary:disabled {
    border-color: var(--color-border);
    background: var(--color-back);
    color: var(--color-text);
    font-weight: normal;
}

.display-sensei-body .ds-tabs {
    display: flex;
    gap: 4px;
    margin-bottom: 10px;
}
.display-sensei-body .ds-tab {
    flex: 1 1 auto;
    min-width: 0;
    padding: 4px;
    font-size: 10px;
    border: 1px solid var(--ds-outline);
    background: var(--color-button);
    color: var(--color-text);
    transition: background 120ms ease, box-shadow 120ms ease, border-color 120ms ease;
}
.display-sensei-body .ds-tab.active {
    border-color: var(--ds-accent);
    background: linear-gradient(180deg, var(--ds-tab-active-top) 0%, var(--ds-tab-active-bottom) 100%);
    box-shadow: var(--ds-glow);
    color: var(--ds-on-accent);
}

.display-sensei-body .ds-subtab-row {
    display: flex;
    gap: 4px;
    margin-bottom: 8px;
}
.display-sensei-body .ds-subtabs {
    flex: 1 1 0;
    min-width: 0;
}
.display-sensei-body .ds-subtab {
    padding: 4px;
}
.display-sensei-body .ds-subtab.active {
    border-color: var(--ds-accent);
    box-shadow: var(--ds-glow);
}
.display-sensei-body .ds-subtabs.ds-grid-5 {
    display: flex;
}
.display-sensei-body .ds-subtabs.ds-grid-5 .ds-subtab {
    flex: 1 1 auto;
    min-width: 0;
    padding: 4px 2px;
}
.display-sensei-body .ds-subtab.ds-worn {
    position: relative;
}
.display-sensei-body .ds-subtab.ds-worn::after {
    content: '';
    position: absolute;
    top: 3px;
    right: 3px;
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: var(--ds-accent);
    pointer-events: none;
}
.display-sensei-body .ds-hand-toggle {
    flex: 0 0 auto;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    padding-left: 4px;
    border-left: 1px solid var(--ds-outline);
}
.display-sensei-body .ds-segment-group {
    flex: 1 1 auto;
    min-width: 0;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
}
.display-sensei-body .ds-segment {
    padding: 4px;
    border-radius: 0;
}
.display-sensei-body .ds-segment:first-child {
    border-radius: 3px 0 0 3px;
}
.display-sensei-body .ds-segment:last-child {
    margin-left: -1px;
    border-radius: 0 3px 3px 0;
}
.display-sensei-body .ds-segment.active {
    position: relative;
    border-color: var(--ds-accent);
    background: color-mix(in srgb, var(--ds-accent) 28%, var(--color-back));
}
.display-sensei-body .ds-segment:hover:not(:disabled) {
    position: relative;
    z-index: 1;
}

.display-sensei-body .ds-view {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin: 8px 0;
    padding: 6px;
    border-radius: 3px;
    background: color-mix(in srgb, var(--color-text) 4%, transparent);
}
.display-sensei-body .ds-view-head {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px;
}
.display-sensei-body .ds-view-head .ds-icon-button {
    margin-left: auto;
}
.display-sensei-body .ds-view-toggle {
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    gap: 2px;
    padding: 4px 6px 4px 2px;
    border-color: transparent;
    background: transparent;
    color: var(--color-subtle_text);
}
.display-sensei-body .ds-view-toggle .material-icons {
    font-size: 16px;
    transform: rotate(-90deg);
    transition: transform 120ms ease;
}
.display-sensei-body .ds-view-toggle.open .material-icons {
    transform: none;
}
.display-sensei-body .ds-flex-row.ds-view-reference {
    align-items: flex-start;
}
.display-sensei-body .ds-view-reference > .ds-row-label {
    line-height: 28px;
}
.display-sensei-body .ds-view-picker {
    flex: 1 1 auto;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
}
.display-sensei-body .ds-view-caption {
    font-size: 10px;
    line-height: 1.4;
    color: var(--color-subtle_text);
    overflow-wrap: anywhere;
}
.display-sensei-body .ds-view-caption-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px;
    min-height: 18px;
}
.display-sensei-body .ds-view-note {
    font-size: 10px;
    line-height: 1.4;
    color: var(--color-text);
    overflow-wrap: anywhere;
}
.display-sensei-body .ds-view .ds-row-label {
    min-width: 60px;
}
.display-sensei-body .ds-view-actions {
    display: flex;
    justify-content: flex-end;
}
.display-sensei-body .ds-view input[type="range"] {
    flex: 1 1 auto;
    margin: 0;
}
.display-sensei-body .ds-view-value {
    flex: 0 0 40px;
    font-size: 11px;
    text-align: right;
    color: var(--color-text);
}
.display-sensei-body .ds-view .ds-check-row {
    min-height: 20px;
    padding: 0;
}
.display-sensei-body .ds-hand-views {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin: 0 0 8px 0;
    padding: 6px;
    border-radius: 3px;
    background: color-mix(in srgb, var(--color-text) 4%, transparent);
}
.display-sensei-body .ds-hand-views-head {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px;
}
.display-sensei-body .ds-hand-view-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 4px;
}
.display-sensei-body .ds-hand-view {
    min-width: 0;
    height: auto;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 2px;
    padding: 2px;
}
.display-sensei-body .ds-hand-view:hover {
    border-color: var(--ds-accent);
}
.display-sensei-body .ds-hand-view-picture {
    position: relative;
    display: block;
    border-radius: 2px;
    overflow: hidden;
    background: var(--color-back);
}
.display-sensei-body .ds-hand-view-picture canvas {
    display: block;
    width: 100%;
    height: auto;
    aspect-ratio: 16 / 9;
}
.display-sensei-body .ds-hand-view-picture canvas.ds-stale {
    opacity: 0.35;
}
.display-sensei-body .ds-hand-view-picture.ds-crosshair::before,
.display-sensei-body .ds-hand-view-picture.ds-crosshair::after {
    content: '';
    position: absolute;
    left: 50%;
    top: 50%;
    background: var(--color-light);
    opacity: 0.8;
    pointer-events: none;
}
.display-sensei-body .ds-hand-view-picture.ds-crosshair::before {
    width: 9px;
    height: 1px;
    transform: translate(-50%, -50%);
}
.display-sensei-body .ds-hand-view-picture.ds-crosshair::after {
    width: 1px;
    height: 9px;
    transform: translate(-50%, -50%);
}
.display-sensei-body .ds-hand-view-label {
    font-size: 10px;
    line-height: 1.4;
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--color-text);
}
.display-sensei-body .ds-calibration-actions {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin: 4px 0;
}
.display-sensei-body .ds-calibration-actions button {
    min-width: 0;
    white-space: normal;
    height: auto;
    min-height: 28px;
}
.display-sensei-body .ds-icon-button {
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    gap: 4px;
}
.display-sensei-body .ds-icon-button .material-icons {
    font-size: 14px;
}
.display-sensei-body .ds-icon-segments {
    min-width: 0;
    display: flex;
}
.display-sensei-body .ds-icon-segments .ds-segment {
    flex: 1 1 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 4px 0;
}
.display-sensei-body .ds-icon-segments .ds-segment + .ds-segment {
    margin-left: -1px;
}
.display-sensei-body .ds-icon-segments .icon {
    font-size: 16px;
    line-height: 18px;
}

.display-sensei-body .ds-route-badge {
    display: flex;
    align-items: center;
    align-self: flex-start;
    gap: 6px;
    max-width: 100%;
    margin-bottom: 10px;
    padding: 3px 10px;
    border: 1px solid var(--ds-outline);
    border-radius: 999px;
    background: color-mix(in srgb, var(--ds-accent) 12%, transparent);
    color: var(--color-text);
    font-size: 11px;
}
.display-sensei-body .ds-route-format {
    font-family: var(--font-code);
    font-size: 10px;
    color: var(--color-subtle_text);
}

.display-sensei-body .ds-section {
    margin-bottom: 12px;
    padding: 8px;
    background: var(--color-back);
    border-radius: 4px;
}
.display-sensei-body .ds-section-label {
    font-size: 11px;
    color: var(--color-subtle_text);
    margin-bottom: 4px;
}
.display-sensei-body .ds-section-head {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 2px 4px;
    margin-bottom: 4px;
}
.display-sensei-body .ds-section-head .ds-section-label {
    flex: 1 1 auto;
    min-width: 0;
    margin-bottom: 0;
}
.display-sensei-body .ds-pivot-key {
    display: inline-block;
    width: 8px;
    height: 8px;
    margin: 0 6px 0 2px;
    vertical-align: 0;
    border-radius: 50%;
    background: var(--ds-pivot-key-color);
    box-shadow: 0 0 0 1px rgba(16, 16, 16, 0.9);
}
.display-sensei-body .ds-pivot-key[data-ds-pivot-key="scale_pivot"] {
    border-radius: 1px;
    transform: rotate(45deg) scale(0.85);
}
.display-sensei-body .ds-reset-button {
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    gap: 2px;
    height: 20px;
    margin-left: auto;
    padding: 0 6px;
    font-size: 10px;
    line-height: 18px;
}
.display-sensei-body .ds-reset-button .material-icons {
    font-size: 12px;
}
.display-sensei-body .ds-transform-box {
    margin-bottom: 15px;
    padding: 10px;
    background: var(--color-back);
    border-radius: 4px;
    border-left: 4px solid var(--ds-accent-strong);
}
.display-sensei-body .ds-transform-box h5 {
    font-size: 13px;
    margin: 0 0 8px 0;
    color: var(--ds-accent-strong);
}
.display-sensei-body .ds-info-card {
    margin-bottom: 15px;
    padding: 10px;
    background: var(--color-back);
    border-radius: 4px;
    border-left: 4px solid var(--color-button);
    color: var(--color-subtle_text);
    font-size: 11px;
    line-height: 1.4;
}
.display-sensei-body .ds-info-card h5 {
    font-size: 13px;
    margin: 0 0 6px 0;
    color: var(--color-text);
}
.display-sensei-body .ds-transform-box p + p,
.display-sensei-body .ds-info-card p + p {
    margin-top: 6px;
}
.display-sensei-body .ds-card-key {
    margin-bottom: 8px;
    font-size: 11px;
    line-height: 1.4;
    color: var(--color-text);
    overflow-wrap: anywhere;
}
.display-sensei-body .ds-card-text {
    font-size: 11px;
    line-height: 1.4;
    color: var(--color-text);
}
.display-sensei-body .ds-card-note {
    padding: 6px 8px;
    border: 1px solid color-mix(in srgb, var(--ds-accent) 35%, transparent);
    border-radius: 3px;
    background: color-mix(in srgb, var(--ds-accent) 10%, transparent);
    font-size: 11px;
    line-height: 1.4;
    color: var(--color-text);
}
.display-sensei-body .ds-hint {
    font-size: 10px;
    line-height: 1.4;
    color: var(--color-subtle_text);
}
.display-sensei-body .ds-code {
    font-family: var(--font-code);
    color: var(--color-text);
}

.display-sensei-body .ds-grid-2 {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 4px;
}
.display-sensei-body .ds-grid-3 {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 4px;
}
.display-sensei-body .ds-grid-4 {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 4px;
}

.display-sensei-body .ds-grid-5 {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 4px;
}

.display-sensei-body .ds-card-head {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 6px;
}
.display-sensei-body .ds-transform-box .ds-card-head h5 {
    flex: 1 1 auto;
    min-width: 0;
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.display-sensei-body .ds-chip {
    flex: 0 0 auto;
    padding: 1px 8px;
    border: 1px solid var(--ds-outline);
    border-radius: 999px;
    font-size: 10px;
    line-height: 16px;
    white-space: nowrap;
    color: var(--color-subtle_text);
}
.display-sensei-body .ds-chip.custom {
    border-color: var(--ds-accent);
    background: color-mix(in srgb, var(--ds-accent) 18%, transparent);
    color: var(--color-text);
}
.display-sensei-body .ds-transform-box .ds-card-key {
    margin-bottom: 4px;
}
.display-sensei-body .ds-transform-box .ds-hint + .ds-card-note,
.display-sensei-body .ds-transform-box .ds-card-note + .ds-hint {
    margin-top: 6px;
}

.display-sensei-body .ds-check-group {
    margin: 8px 0;
}
.display-sensei-body .ds-check-row {
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 24px;
    padding: 2px 0;
    margin: 0;
    font-size: 11px;
    color: var(--color-text);
    cursor: pointer;
}
.display-sensei-body .ds-check-row > span {
    flex: 1 1 auto;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    line-height: 1.4;
}
.display-sensei-body .ds-check-row > input[type="checkbox"] {
    flex: 0 0 14px;
    width: 14px;
    min-width: 0;
    height: 14px;
    margin: 0;
    appearance: none;
    display: inline-grid;
    place-content: center;
    border: 1px solid var(--ds-outline);
    border-radius: 2px;
    background: var(--color-back);
    cursor: pointer;
}
.display-sensei-body .ds-check-row > input[type="checkbox"]::before {
    content: '\\2713';
    font-family: inherit;
    font-weight: normal;
    font-size: 10px;
    line-height: 1;
    color: var(--ds-on-accent);
    transform: scale(0);
    transition: transform 80ms ease-in-out;
}
.display-sensei-body .ds-check-row > input[type="checkbox"]:checked {
    border-color: var(--ds-accent-strong);
    background: var(--ds-accent-strong);
}
.display-sensei-body .ds-check-row > input[type="checkbox"]:checked::before {
    transform: scale(1);
}
.display-sensei-body .ds-check-row > input[type="checkbox"]:focus-visible {
    box-shadow: 0 0 0 1px var(--ds-accent-strong);
}
.display-sensei-body .ds-check-row.ds-check-sub {
    padding-left: 22px;
}

.display-sensei-body .ds-channel-tabs {
    margin-bottom: 8px;
}
.display-sensei-body .ds-channel {
    margin-bottom: 8px;
}
.display-sensei-body .ds-channel .ds-check-row {
    margin-bottom: 2px;
}
.display-sensei-body .ds-pos-labels {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 4px;
    margin-bottom: 2px;
    font-size: 10px;
    color: var(--color-subtle_text);
    text-align: center;
}
.display-sensei-body .ds-pos-inputs {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 4px;
    margin-bottom: 6px;
}
.display-sensei-body .ds-field {
    margin-bottom: 6px;
}
.display-sensei-body .ds-flex-row {
    display: flex;
    align-items: center;
    gap: 4px;
}
.display-sensei-body .ds-flex-row > select {
    flex: 1 1 auto;
    min-width: 0;
}
.display-sensei-body .ds-row-label {
    flex: 0 0 auto;
    font-size: 11px;
    color: var(--color-subtle_text);
}
.display-sensei-body .ds-nudge-grid {
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: 4px;
}
.display-sensei-body .ds-nudge-grid button,
.display-sensei-body .ds-quick-grid button {
    padding: 4px 2px;
}
.display-sensei-body input[type="range"] {
    display: block;
    width: 100%;
    min-width: 0;
    height: 24px;
    margin: 0 0 4px 0;
    --color-thumb: var(--ds-accent);
}
.display-sensei-body .ds-slider-row {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-bottom: 4px;
}
.display-sensei-body .ds-slider-row input[type="range"] {
    flex: 1 1 auto;
    margin: 0;
}
.display-sensei-body .ds-axis-toggle {
    flex: 0 0 auto;
}
.display-sensei-body .ds-axis-toggle button {
    width: 24px;
    padding: 4px 0;
}
.display-sensei-body .ds-turn-row {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 4px;
}
.display-sensei-body .ds-turn-row .ds-grid-3 {
    flex: 1 1 auto;
    min-width: 0;
}
.display-sensei-body .ds-item-turn {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-top: 6px;
}
.display-sensei-body .ds-gimbal-note {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin: 0 0 6px 0;
}
.display-sensei-body .ds-gimbal-note button {
    min-width: 0;
    height: auto;
    min-height: 24px;
    white-space: normal;
}
.display-sensei-body .ds-match-row {
    display: flex;
    flex-direction: column;
    margin: 0 0 8px 0;
}
.display-sensei-body .ds-match-row .ds-icon-button {
    justify-content: center;
}

.display-sensei-body .ds-collapse {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    margin-bottom: 8px;
    text-align: left;
}
.display-sensei-body .ds-collapse .material-icons {
    font-size: 16px;
    transition: transform 120ms ease;
}
.display-sensei-body .ds-collapse.open .material-icons {
    transform: rotate(180deg);
}

.display-sensei-body .ds-card-actions {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-bottom: 10px;
}
.display-sensei-body .ds-preset-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 4px;
}
.display-sensei-body .ds-preset-row button {
    min-width: 64px;
}
.display-sensei-body .ds-slot-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-top: 4px;
}
.display-sensei-body .ds-slot-actions button {
    flex: 1 1 0;
    min-width: max-content;
}

.display-sensei-body .ds-output-code {
    min-height: 80px;
    font-family: var(--font-code);
    font-size: 10px;
    tab-size: 2;
    white-space: pre;
    overflow: auto;
}
.display-sensei-body .ds-output-code::placeholder {
    color: var(--color-subtle_text);
    white-space: pre-wrap;
}
.display-sensei-body .ds-output-actions {
    margin: 6px 0;
}
.display-sensei-body .ds-output-version {
    margin: 6px 0;
    font-size: 11px;
    color: var(--color-text);
}
.display-sensei-body .ds-output-version + .ds-card-note {
    margin-bottom: 6px;
}
.display-sensei-body .ds-output-label {
    margin-top: 8px;
}
.display-sensei-body .ds-empty-note {
    padding: 8px 10px;
    border-left: 3px solid var(--ds-outline);
    border-radius: 3px;
    background: color-mix(in srgb, var(--color-text) 4%, transparent);
    font-size: 11px;
    line-height: 1.4;
    color: var(--color-subtle_text);
}

.display-sensei-body .ds-link-card {
    border-left-color: var(--ds-accent-strong);
}
.display-sensei-body .ds-link-card > * + * {
    margin-top: 6px;
}
.display-sensei-body .ds-link-line {
    color: var(--color-text);
    overflow-wrap: anywhere;
}
.display-sensei-body .ds-link-packs p + p {
    margin-top: 2px;
}
.display-sensei-body .ds-link-files {
    display: flex;
    flex-direction: column;
    gap: 2px;
}
.display-sensei-body .ds-link-files .ds-section-label {
    margin: 4px 0 0 0;
}
.display-sensei-body .ds-link-file {
    padding: 4px 6px;
    border-radius: 3px;
    background: color-mix(in srgb, var(--color-text) 4%, transparent);
}
.display-sensei-body .ds-link-file-head,
.display-sensei-body .ds-link-file-detail {
    display: flex;
    align-items: center;
    gap: 4px;
}
.display-sensei-body .ds-link-file-detail {
    margin-top: 2px;
}
.display-sensei-body .ds-link-file-head .ds-code {
    flex: 1 1 0;
    min-width: 0;
    font-size: 10px;
    overflow-wrap: anywhere;
}
.display-sensei-body .ds-link-file-detail .ds-hint {
    flex: 1 1 0;
    min-width: 0;
}
.display-sensei-body .ds-link-file.ds-link-absent .ds-code {
    color: var(--color-subtle_text);
}
.display-sensei-body .ds-link-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-top: 8px;
}
.display-sensei-body .ds-link-actions button {
    flex: 1 1 0;
    min-width: max-content;
}

.display-sensei-body .ds-info-actions {
    display: flex;
    margin-top: 8px;
}
.display-sensei-body .ds-info-actions .ds-icon-button {
    flex: 1 1 auto;
    justify-content: center;
}

.display-sensei-body .ds-armor-card .ds-card-note {
    margin-top: 6px;
}
.display-sensei-body .ds-armor-kind {
    margin-top: 6px;
}
.display-sensei-body .ds-armor-view-label {
    margin: 4px 0 0 0;
}
.display-sensei-body .ds-armor-view .ds-view-head .ds-armor-view-label {
    flex: 1 1 auto;
    min-width: 0;
    margin: 0;
}
.display-sensei-body .ds-armor-wide-button {
    justify-content: center;
    width: 100%;
}
.display-sensei-body .ds-armor-poses {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
}
.display-sensei-body .ds-armor-poses button {
    flex: 1 1 auto;
    min-width: max-content;
}
.display-sensei-body .ds-armor-section {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-top: 8px;
}
.display-sensei-body .ds-armor-section > .ds-section-label {
    margin-bottom: 0;
}
.display-sensei-body .ds-armor-check {
    padding: 4px 6px;
    border-left: 3px solid var(--ds-outline);
    border-radius: 3px;
    background: color-mix(in srgb, var(--color-text) 4%, transparent);
}
.display-sensei-body .ds-armor-check.ds-severity-error {
    border-left-color: var(--color-error);
}
.display-sensei-body .ds-armor-check.ds-severity-warning {
    border-left-color: var(--color-warning);
}
.display-sensei-body .ds-armor-check.ds-severity-info {
    border-left-color: var(--ds-accent);
}
.display-sensei-body .ds-armor-check-head {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px;
    margin-bottom: 2px;
}
.display-sensei-body .ds-chip.ds-chip-error {
    border-color: var(--color-error);
    color: var(--color-text);
}
.display-sensei-body .ds-chip.ds-chip-warning {
    border-color: var(--color-warning);
    color: var(--color-text);
}
.display-sensei-body .ds-armor-check-text {
    font-size: 11px;
    line-height: 1.4;
    color: var(--color-text);
    overflow-wrap: anywhere;
}
.display-sensei-body .ds-armor-fixes {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-top: 4px;
}
.display-sensei-body .ds-armor-fixes button {
    flex: 1 1 auto;
    min-width: max-content;
}
.display-sensei-body .ds-armor-fit .ds-channel-tabs {
    margin-bottom: 0;
}
.display-sensei-body .ds-armor-fit-name {
    margin-bottom: 2px;
    font-size: 11px;
    line-height: 1.4;
    color: var(--color-text);
    overflow-wrap: anywhere;
}
.display-sensei-body .ds-armor-fit-bone .ds-pos-inputs {
    margin-bottom: 2px;
}
.display-sensei-body .ds-armor-fit-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-top: 2px;
}
.display-sensei-body .ds-armor-fit-actions button {
    flex: 1 1 0;
    min-width: max-content;
}
.display-sensei-body .ds-armor-facts-toggle {
    margin: 8px 0 4px 0;
}
.display-sensei-body .ds-armor-facts {
    display: flex;
    flex-direction: column;
    gap: 4px;
}
.display-sensei-body .ds-armor-facts .ds-armor-fact {
    margin: 0;
}
.display-sensei-body .ds-armor-fact {
    font-size: 11px;
    line-height: 1.4;
    color: var(--color-text);
    overflow-wrap: anywhere;
}
.display-sensei-body .ds-armor-fact .ds-chip {
    margin-right: 2px;
}

.display-sensei-body fieldset.ds-channel {
    min-width: 0;
    margin: 0 0 8px 0;
    padding: 0;
    border: 0;
}
.display-sensei-body fieldset.ds-channel:disabled {
    opacity: 0.6;
}
.display-sensei-body [data-ds-hold-key] .ds-code {
    overflow-wrap: anywhere;
}
.display-sensei-body .ds-hold-write .ds-hold-file {
    margin: 4px 0;
    overflow-wrap: anywhere;
}
.display-sensei-body .ds-hold-write .ds-wide-button {
    width: 100%;
    margin-top: 2px;
}
.display-sensei-body .ds-transform-box > .ds-armor-check {
    margin-top: 6px;
}
`;

function injectPanelCss() {
    let deletable = Blockbench.addCSS(DS_PANEL_CSS, '');
    let styleNode = document.head.lastElementChild;
    if (styleNode && styleNode.tagName === 'STYLE') {
        styleNode.id = CSS_STYLE_ID;
    }
    return deletable;
}
