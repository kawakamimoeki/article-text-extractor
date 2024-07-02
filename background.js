chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "extractText") {
    chrome.storage.local.get(["openaiApiKey"], (result) => {
      if (!result.openaiApiKey) {
        chrome.runtime.sendMessage({
          action: "getCss",
          error:
            "Error: OpenAI API Key not set. Please set your API key in the extension popup.",
        });
        return;
      }

      fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${result.openaiApiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content:
                "You are a helpful assistant that extracts the main content from web pages.",
            },
            {
              role: "user",
              content: `This is a web article.
Extract only the text.
Exclude the sidebar, footer and other parts.
Output the css selector of article content in JSON.

output example:
{
  "css": "CSS Selector"
}

html:
\`\`\`html
${request.html}
\`\`\`

output JSON:
`,
            },
          ],
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.error) {
            throw data.error;
          }
          const json = JSON.parse(data.choices[0].message.content);
          chrome.runtime.sendMessage({
            action: "getCss",
            css: json.css.includes(",") ? json.css.split(",")[0] : json.css,
          });
        })
        .catch((error) => {
          chrome.runtime.sendMessage({
            action: "getCss",
            error: `Error: ${error.message}`,
          });
        });
    });
  }
});
