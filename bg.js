chrome.browserAction.onClicked.addListener(function(tab) {
  chrome.tabs.create({'url': 'popup.html'}, function(tab) {
    // Tab opened.
  });
});