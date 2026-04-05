const MAX_HIGHLIGHT_LENGTH = 5000;
const POPUP_MARGIN = 12;

let highlightUi = null;
let activeSelection = null;
let hideToastTimeoutId = null;
let dismissedSelectionKey = null;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getPageData") {
    sendResponse({
      url: window.location.href,
      title: document.title,
      description: document.querySelector('meta[name="description"]')?.content || "",
    });
  }
});

function ensureHighlightUi() {
  if (highlightUi) {
    return highlightUi;
  }

  const host = document.createElement("div");
  host.id = "__memora-highlight-host";
  host.style.position = "fixed";
  host.style.inset = "0";
  host.style.pointerEvents = "none";
  host.style.zIndex = "2147483647";

  const shadowRoot = host.attachShadow({ mode: "open" });
  shadowRoot.innerHTML = `
    <style>
      .memora-popup,
      .memora-toast {
        font-family: "Segoe UI", Arial, sans-serif;
        box-sizing: border-box;
      }

      .memora-popup {
        position: absolute;
        width: min(320px, calc(100vw - 24px));
        border: 1px solid rgba(255, 255, 255, 0.14);
        background:
          linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03)),
          #050505;
        color: #ffffff;
        padding: 12px;
        box-shadow: 0 20px 48px rgba(0, 0, 0, 0.42);
        pointer-events: auto;
      }

      .memora-popup[hidden] {
        display: none;
      }

      .memora-toast {
        position: fixed;
        right: 20px;
        bottom: 20px;
        max-width: min(360px, calc(100vw - 32px));
        border: 1px solid rgba(255, 255, 255, 0.12);
        background: rgba(10, 10, 10, 0.96);
        color: #ffffff;
        padding: 12px 14px;
        box-shadow: 0 16px 42px rgba(0, 0, 0, 0.38);
        opacity: 0;
        transform: translateY(8px);
        transition: opacity 180ms ease, transform 180ms ease;
      }

      .memora-toast[data-open="true"] {
        opacity: 1;
        transform: translateY(0);
      }

      .memora-toast[data-tone="error"] {
        border-color: rgba(255, 118, 118, 0.38);
      }

      .memora-kicker {
        margin: 0;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.24em;
        text-transform: uppercase;
        color: rgba(255, 255, 255, 0.68);
      }

      .memora-text {
        margin: 8px 0 0;
        font-size: 13px;
        line-height: 1.5;
        color: rgba(255, 255, 255, 0.88);
        display: -webkit-box;
        overflow: hidden;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 4;
      }

      .memora-meta {
        margin: 8px 0 0;
        font-size: 11px;
        line-height: 1.5;
        color: rgba(255, 255, 255, 0.66);
      }

      .memora-actions {
        display: flex;
        gap: 8px;
        margin-top: 12px;
      }

      .memora-button {
        border: none;
        cursor: pointer;
        border-radius: 0.2rem;
        padding: 10px 12px;
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        transition: opacity 180ms ease, transform 180ms ease, background 180ms ease;
      }

      .memora-button:hover:not(:disabled) {
        transform: translateY(-1px);
      }

      .memora-button:disabled {
        opacity: 0.56;
        cursor: not-allowed;
      }

      .memora-button-primary {
        background: linear-gradient(135deg, #ffe985 0%, #f6bf4d 100%);
        color: #050505;
      }

      .memora-button-secondary {
        background: rgba(255, 255, 255, 0.08);
        color: #ffffff;
      }

      .memora-toast-title {
        margin: 0;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.22em;
        text-transform: uppercase;
        color: rgba(255, 255, 255, 0.68);
      }

      .memora-toast-copy {
        margin: 6px 0 0;
        font-size: 12px;
        line-height: 1.5;
        color: rgba(255, 255, 255, 0.92);
      }
    </style>

    <div class="memora-popup" hidden>
      <p class="memora-kicker">Memora Highlight</p>
      <p class="memora-text"></p>
      <p class="memora-meta">Save this selection to the current article in Memora.</p>
      <div class="memora-actions">
        <button class="memora-button memora-button-primary" type="button">Save Highlight</button>
        <button class="memora-button memora-button-secondary" type="button">Dismiss</button>
      </div>
    </div>

    <div class="memora-toast" data-open="false" data-tone="success">
      <p class="memora-toast-title">Memora</p>
      <p class="memora-toast-copy"></p>
    </div>
  `;

  document.documentElement.appendChild(host);

  const popup = shadowRoot.querySelector(".memora-popup");
  const text = shadowRoot.querySelector(".memora-text");
  const meta = shadowRoot.querySelector(".memora-meta");
  const saveButton = shadowRoot.querySelector(".memora-button-primary");
  const dismissButton = shadowRoot.querySelector(".memora-button-secondary");
  const toast = shadowRoot.querySelector(".memora-toast");
  const toastCopy = shadowRoot.querySelector(".memora-toast-copy");

  popup.addEventListener("mousedown", (event) => {
    event.preventDefault();
  });
  saveButton.addEventListener("click", handleSaveHighlight);
  dismissButton.addEventListener("click", () => {
    hidePopup({ dismissSelection: true });
  });

  highlightUi = {
    host,
    shadowRoot,
    popup,
    text,
    meta,
    saveButton,
    dismissButton,
    toast,
    toastCopy,
  };

  return highlightUi;
}

function normalizeWhitespace(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
}

function truncateText(value, limit = 220) {
  if (value.length <= limit) {
    return value;
  }

  return `${value.slice(0, limit - 3).trimEnd()}...`;
}

function getSelectionKey(selectionPayload) {
  if (!selectionPayload) {
    return "";
  }

  return [
    normalizeWhitespace(selectionPayload.text),
    normalizeWhitespace(selectionPayload.pageUrl),
    normalizeWhitespace(selectionPayload.contextBefore),
    normalizeWhitespace(selectionPayload.contextAfter),
  ].join("::");
}

function isEditableNode(node) {
  const element = node?.nodeType === Node.ELEMENT_NODE ? node : node?.parentElement;
  return Boolean(element?.closest("input, textarea, [contenteditable=''], [contenteditable='true'], [role='textbox']"));
}

function extractSelectionContext(range, selectedText) {
  const ancestorText = normalizeWhitespace(range.commonAncestorContainer?.textContent || "");
  const compactSelection = normalizeWhitespace(selectedText);

  if (!ancestorText || !compactSelection) {
    return { before: "", after: "" };
  }

  const selectedIndex = ancestorText.indexOf(compactSelection);
  if (selectedIndex === -1) {
    return { before: "", after: "" };
  }

  return {
    before: ancestorText.slice(Math.max(0, selectedIndex - 120), selectedIndex).trim(),
    after: ancestorText
      .slice(selectedIndex + compactSelection.length, selectedIndex + compactSelection.length + 120)
      .trim(),
  };
}

function getSelectionPayload() {
  const selection = window.getSelection();

  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
    return null;
  }

  if (isEditableNode(selection.anchorNode) || isEditableNode(selection.focusNode)) {
    return null;
  }

  const text = selection.toString().trim();
  if (!text || text.length < 2) {
    return null;
  }

  const range = selection.getRangeAt(0).cloneRange();
  const rect = range.getBoundingClientRect();

  if (!rect || (!rect.width && !rect.height)) {
    return null;
  }

  const context = extractSelectionContext(range, text);

  return {
    text,
    pageTitle: document.title || "",
    pageUrl: window.location.href,
    contextBefore: context.before,
    contextAfter: context.after,
    rect,
    tooLong: text.length > MAX_HIGHLIGHT_LENGTH,
  };
}

function positionPopup(rect) {
  const ui = ensureHighlightUi();

  ui.popup.hidden = false;
  ui.popup.style.visibility = "hidden";
  ui.popup.style.left = "0";
  ui.popup.style.top = "0";

  requestAnimationFrame(() => {
    const popupWidth = ui.popup.offsetWidth;
    const popupHeight = ui.popup.offsetHeight;
    const centeredLeft = rect.left + rect.width / 2 - popupWidth / 2;
    const safeLeft = Math.min(
      Math.max(POPUP_MARGIN, centeredLeft),
      window.innerWidth - popupWidth - POPUP_MARGIN
    );

    let top = rect.top - popupHeight - 14;
    if (top < POPUP_MARGIN) {
      top = rect.bottom + 14;
    }

    const safeTop = Math.min(
      Math.max(POPUP_MARGIN, top),
      window.innerHeight - popupHeight - POPUP_MARGIN
    );

    ui.popup.style.left = `${safeLeft}px`;
    ui.popup.style.top = `${safeTop}px`;
    ui.popup.style.visibility = "visible";
  });
}

function showPopup(selectionPayload) {
  const ui = ensureHighlightUi();

  activeSelection = selectionPayload;
  dismissedSelectionKey = null;
  ui.text.textContent = truncateText(normalizeWhitespace(selectionPayload.text));

  if (selectionPayload.tooLong) {
    ui.meta.textContent = `Choose a shorter selection. Highlights are limited to ${MAX_HIGHLIGHT_LENGTH} characters.`;
    ui.saveButton.textContent = "Too Long";
    ui.saveButton.disabled = true;
  } else {
    ui.meta.textContent = "Save this selection to the current article in Memora.";
    ui.saveButton.textContent = "Save Highlight";
    ui.saveButton.disabled = false;
  }

  positionPopup(selectionPayload.rect);
}

function hidePopup(options = {}) {
  const ui = ensureHighlightUi();
  const { dismissSelection = false, clearDismissedSelection = false } = options;

  if (dismissSelection && activeSelection) {
    dismissedSelectionKey = getSelectionKey(activeSelection);
  } else if (clearDismissedSelection) {
    dismissedSelectionKey = null;
  }

  ui.popup.hidden = true;
  activeSelection = null;
}

function showToast(message, tone = "success") {
  const ui = ensureHighlightUi();

  ui.toast.dataset.tone = tone;
  ui.toastCopy.textContent = message;
  ui.toast.dataset.open = "true";

  window.clearTimeout(hideToastTimeoutId);
  hideToastTimeoutId = window.setTimeout(() => {
    ui.toast.dataset.open = "false";
  }, 2600);
}

function refreshSelectionPopup() {
  window.setTimeout(() => {
    const selectionPayload = getSelectionPayload();

    if (!selectionPayload) {
      hidePopup({ clearDismissedSelection: true });
      return;
    }

    if (getSelectionKey(selectionPayload) === dismissedSelectionKey) {
      hidePopup();
      return;
    }

    showPopup(selectionPayload);
  }, 0);
}

async function handleSaveHighlight() {
  const ui = ensureHighlightUi();

  if (!activeSelection || activeSelection.tooLong) {
    return;
  }

  ui.saveButton.disabled = true;
  ui.saveButton.textContent = "Saving...";
  ui.meta.textContent = "Saving this highlight to Memora...";

  try {
    const response = await chrome.runtime.sendMessage({
      action: "saveHighlight",
      text: activeSelection.text,
      pageTitle: activeSelection.pageTitle,
      pageUrl: activeSelection.pageUrl,
      contextBefore: activeSelection.contextBefore,
      contextAfter: activeSelection.contextAfter,
    });

    if (response?.ok) {
      const successMessage = response.duplicate
        ? "This highlight was already saved for the current item."
        : "Highlight saved to this item.";

      showToast(successMessage, "success");
      hidePopup({ clearDismissedSelection: true });
      window.getSelection()?.removeAllRanges();
      return;
    }

    const errorMessage = response?.message || "Failed to save highlight.";
    ui.meta.textContent = errorMessage;
    ui.saveButton.disabled = false;
    ui.saveButton.textContent = "Save Highlight";
    showToast(errorMessage, "error");
  } catch (error) {
    ui.meta.textContent = "Failed to save highlight.";
    ui.saveButton.disabled = false;
    ui.saveButton.textContent = "Save Highlight";
    showToast(error.message || "Failed to save highlight.", "error");
  }
}

document.addEventListener("mouseup", refreshSelectionPopup);
document.addEventListener("keyup", (event) => {
  if (event.key === "Shift" || event.key === "ArrowLeft" || event.key === "ArrowRight" || event.key === "ArrowUp" || event.key === "ArrowDown") {
    refreshSelectionPopup();
  }
});

document.addEventListener(
  "mousedown",
  (event) => {
    const ui = ensureHighlightUi();
    if (ui.popup.hidden) {
      return;
    }

    if (event.composedPath().includes(ui.host)) {
      return;
    }

    hidePopup({ dismissSelection: true });
  },
  true
);

document.addEventListener("scroll", () => {
  const ui = ensureHighlightUi();
  if (!ui.popup.hidden) {
    hidePopup({ dismissSelection: true });
  }
}, true);

document.addEventListener("selectionchange", () => {
  const selection = window.getSelection();
  if (!selection || selection.isCollapsed) {
    hidePopup({ clearDismissedSelection: true });
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    hidePopup({ dismissSelection: true });
  }
});
