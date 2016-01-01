var backgroundPage;

console.log("ExtensionUtils loaded...");

var ExtensionUtils = {
    getBackgroundPage: function () {
      if (!backgroundPage) {
        backgroundPage = chrome.extension.getBackgroundPage();
      }
      return backgroundPage;
    },

    getPageTitleElement: function () {
      return document.getElementsByClassName('webpage-title')[0];
    },

    setPageTitle: function () {
      this.getPageTitleElement().innerHTML = this.getBackgroundPage().sourcePageUrl;
    },

    getCodeTree: function () {
      return this.getBackgroundPage().codeTree;
    },

    goToSourcePage: function () {
      var tabId = this.getBackgroundPage().sourcePageTab;
      console.log("goToSourcePage: ", tabId);
      if (chrome.tabs.get(tabId)) {
        chrome.tabs.update(tabId, {"selected": true});
      } else {
        console.log("Source Page Tab does not exist anymore.");
      }
    },

    getReactComponentRoot: function () {
      return this.getBackgroundPage().getReactComponents();
    }
};



module.exports = ExtensionUtils;