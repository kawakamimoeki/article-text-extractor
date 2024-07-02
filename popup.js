function setStatus(message) {
  document.getElementById("status").textContent = message;
}

document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.local.get(["openaiApiKey"], (result) => {
    if (result.openaiApiKey) {
      document.getElementById("apiKeyInput").value = result.openaiApiKey;
    }
  });
});

document.getElementById("saveApiKey").addEventListener("click", () => {
  const apiKey = document.getElementById("apiKeyInput").value;
  chrome.storage.local.set({ openaiApiKey: apiKey }, () => {
    setStatus("API Key saved successfully!");
  });
});

document.getElementById("extractButton").addEventListener("click", async () => {
  setStatus("Extracting text...");
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {
      action: "getBody",
    });
  });
});

document.getElementById("copyButton").addEventListener("click", () => {
  const content = document.getElementById("extractedContent").textContent;
  navigator.clipboard.writeText(content).then(() => {
    setStatus("Content copied to clipboard!");
  });
});

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === "getCss") {
    if (request.error) {
      document.getElementById("extractedContent").textContent = request.error;
      setStatus("Error!");
      return;
    }
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: "getText",
        css: request.css,
      });
    });
  } else if (request.action === "displayExtractedContent") {
    document.getElementById("extractedContent").textContent = request.text;
    setStatus("Content extracted successfully!");
  }
});
