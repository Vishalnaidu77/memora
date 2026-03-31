chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getPageData') {
    sendResponse({
      url: window.location.href,
      title: document.title,
      description: document.querySelector('meta[name="description"]')?.content || ''
    })
  }
})