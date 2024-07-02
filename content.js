chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getText") {
    const text = document.querySelector(
      request.css.replaceAll(/>/g, "")
    ).innerText;
    chrome.runtime.sendMessage({
      action: "displayExtractedContent",
      text,
    });
  } else if (request.action === "getBody") {
    const body = document.createElement("body");
    body.innerHTML = document.body.innerHTML;
    body.querySelectorAll("script").forEach((script) => script.remove());
    body.querySelectorAll("iframe").forEach((iframe) => iframe.remove());
    body.querySelectorAll("svg").forEach((svg) => svg.remove());
    body.querySelectorAll("pre").forEach((pre) => pre.remove());

    const s = removeAllPropertiesExceptClass(body.innerHTML);

    chrome.runtime.sendMessage({
      action: "extractText",
      html: s,
    });
  }
});

function removeAllPropertiesExceptClass(htmlString) {
  var parser = new DOMParser();
  var doc = parser.parseFromString(htmlString, "text/html");

  doc.querySelectorAll("*").forEach(function (element) {
    var attributes = element.attributes;
    for (var i = attributes.length - 1; i >= 0; i--) {
      var attrName = attributes[i].name;
      if (attrName !== "class") {
        element.removeAttribute(attrName);
      } else {
        element.className = element.className.split(" ")[0];
      }
    }
  });

  return doc.body.innerHTML;
}
