const API_BASE_URL = "http://localhost:3001/api";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action !== "saveHighlight") {
    return undefined;
  }

  handleSaveHighlight(request)
    .then(sendResponse)
    .catch((error) => {
      sendResponse({
        ok: false,
        status: 500,
        message: error.message || "Failed to save highlight.",
      });
    });

  return true;
});

async function handleSaveHighlight(request) {
  const { token } = await chrome.storage.local.get("token");

  if (!token) {
    return {
      ok: false,
      status: 401,
      message: "Your session expired. Log in again in the Memora extension.",
    };
  }

  const response = await fetch(`${API_BASE_URL}/item/highlights`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      text: request.text,
      pageTitle: request.pageTitle,
      pageUrl: request.pageUrl,
      contextBefore: request.contextBefore,
      contextAfter: request.contextAfter,
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (response.status === 401) {
    await chrome.storage.local.remove(["token", "userEmail"]);
  }

  return {
    ok: response.ok,
    status: response.status,
    duplicate: Boolean(data.duplicate),
    message: data.message || "Failed to save highlight.",
    itemId: data.itemId || null,
    highlight: data.highlight || null,
  };
}
