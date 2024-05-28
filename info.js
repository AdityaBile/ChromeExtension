document.getElementById("main-popup").addEventListener("click", function () {
  chrome.windows.getCurrent(function (currentWindow) {
    chrome.windows.create(
      {
        url: "popup.html",
        type: "popup",
        width: currentWindow.width,
        height: currentWindow.height,
        top: currentWindow.top,
        left: currentWindow.left,
      },
      function (newWindow) {
        chrome.windows.remove(currentWindow.id);
      }
    );
  });
});
