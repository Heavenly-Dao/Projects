chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ color: '#3aa757' }, () => {
    console.log('The color is green.');
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getColor') {
    chrome.storage.sync.get('color', (data) => {
      sendResponse({ color: data.color });
    });
    return true; // Keep the message channel open for sendResponse
  }
});
