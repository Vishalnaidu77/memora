document.addEventListener("DOMContentLoaded", async () => {
  const emailInput = document.getElementById("email")
  const passwordInput = document.getElementById("password")
  const loginBtn = document.getElementById("login-btn")
  const saveBtn = document.getElementById("save-btn")
  const urlInput = document.getElementById("url")
  const status = document.getElementById("status")

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  urlInput.value = tab?.url || ""

  loginBtn.addEventListener("click", async () => {
    const email = emailInput.value
    const password = passwordInput.value

    const response = await fetch("http://localhost:3001/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    })

    const data = await response.json()

    if (response.ok) {
      await chrome.storage.local.set({ token: data.token })
      status.textContent = "Login successful"
    } else {
      status.textContent = data.message || "Login failed"
    }
  })

  saveBtn.addEventListener("click", async () => {
    const { token } = await chrome.storage.local.get("token")

    if (!token) {
      status.textContent = "Please log in first"
      return
    }

    const response = await fetch("http://localhost:3001/api/item/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        url: urlInput.value
      })
    })

    if (response.ok) {
      status.textContent = "Saved to Memora!"
    } else {
      status.textContent = "Failed to save"
    }
  })
})
