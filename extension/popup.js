const API_BASE_URL = "https://memora-8xw8.onrender.com/api"

document.addEventListener("DOMContentLoaded", async () => {
  const emailInput = document.getElementById("email")
  const passwordInput = document.getElementById("password")
  const urlInput = document.getElementById("url")
  const loginBtn = document.getElementById("login-btn")
  const saveBtn = document.getElementById("save-btn")
  const loginView = document.getElementById("login-view")
  const saveView = document.getElementById("save-view")
  const subtitle = document.getElementById("subtitle")
  const status = document.getElementById("status")

  function setStatus(message = "", type = "") {
    status.textContent = message
    status.className = ["status", type].filter(Boolean).join(" ")
  }

  function setButtonLoading(button, loading, loadingLabel) {
    if (!button.dataset.label) {
      button.dataset.label = button.textContent
    }

    button.disabled = loading
    button.textContent = loading ? loadingLabel : button.dataset.label
  }

  function toggleView(isLoggedIn) {
    loginView.hidden = isLoggedIn
    saveView.hidden = !isLoggedIn
    subtitle.textContent = isLoggedIn
      ? "Your session is active. Capture this page into your archive."
      : "Sign in to send this page directly to your archive."
  }

  async function getActivePageData() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    const pageData = {
      url: tab?.url || ""
    }

    if (!tab?.id) {
      return pageData
    }

    try {
      const tabResponse = await chrome.tabs.sendMessage(tab.id, { action: "getPageData" })
      return {
        url: tabResponse?.url || pageData.url
      }
    } catch (error) {
      return pageData
    }
  }

  async function populatePageData() {
    const pageData = await getActivePageData()
    urlInput.value = pageData.url || ""
  }

  async function hydratePopup() {
    const { token } = await chrome.storage.local.get("token")
    toggleView(Boolean(token))
    await populatePageData()

    if (token) {
      setStatus("Session active. Ready to save this page.", "success")
    } else {
      setStatus("")
    }
  }

  ;[emailInput, passwordInput].forEach((input) => {
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && !loginBtn.disabled) {
        loginBtn.click()
      }
    })
  })

  ;[urlInput].forEach((input) => {
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && !saveBtn.disabled) {
        saveBtn.click()
      }
    })
  })

  loginBtn.addEventListener("click", async () => {
    const email = emailInput.value.trim()
    const password = passwordInput.value.trim()

    if (!email || !password) {
      setStatus("Enter your email and password to continue.", "error")
      return
    }

    setButtonLoading(loginBtn, true, "Initializing...")
    setStatus("Verifying your credentials...")

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Login failed")
      }

      await chrome.storage.local.set({
        token: data.token,
        userEmail: data.user?.email || email
      })

      passwordInput.value = ""
      toggleView(true)
      await populatePageData()
      setStatus("Session initialized. Your page is ready to save.", "success")
    } catch (error) {
      setStatus(error.message || "Unable to log in right now.", "error")
    } finally {
      setButtonLoading(loginBtn, false, "Initializing...")
    }
  })

  saveBtn.addEventListener("click", async () => {
    const url = urlInput.value.trim()
    const { token } = await chrome.storage.local.get("token")

    if (!token) {
      toggleView(false)
      setStatus("Your session expired. Log in again to continue.", "error")
      return
    }

    if (!url) {
      setStatus("Add a valid page URL before saving.", "error")
      return
    }

    setButtonLoading(saveBtn, true, "Saving...")
    setStatus("Saving this page to Memora...")

    try {
      const response = await fetch(`${API_BASE_URL}/item/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          url
        })
      })

      const data = await response.json().catch(() => ({}))

      if (response.status === 401) {
        await chrome.storage.local.remove(["token", "userEmail"])
        toggleView(false)
        setStatus("Your session expired. Log in again to keep saving.", "error")
        return
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to save this page")
      }

      setStatus("Saved to Memora successfully.", "success")
    } catch (error) {
      setStatus(error.message || "Failed to save this page.", "error")
    } finally {
      setButtonLoading(saveBtn, false, "Saving...")
    }
  })

  await hydratePopup()
})
