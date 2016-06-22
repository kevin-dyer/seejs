var backgroundPage,
    port = chrome.extension.connect({name: "Bubble Vis"});

console.log("ExtensionUtils loaded...");

function getBackgroundPage () {
  if (!backgroundPage) {
    backgroundPage = chrome.extension.getBackgroundPage();
  }
  return backgroundPage;
}

function setPageTitle () {
  getPageTitleElement().innerHTML = getBackgroundPage().sourcePageUrl;
}

function getPageTitleElement() {
  return document.getElementsByClassName('webpage-title')[0];
}

var ExtensionUtils = {
    getBackgroundPage: getBackgroundPage,

    getPageTitleElement: getPageTitleElement,

    setPageTitle: setPageTitle,

    getCodeTree: function () {
      return getBackgroundPage().codeTree;
    },

    goToSourcePage: function () {
      var tabId = getBackgroundPage().sourcePageTab;
      console.log("goToSourcePage: ", tabId);
      chrome.tabs.get(tabId, function (tab) {
        if (tab){
          chrome.tabs.update(tabId, {"selected": true});
        }
        else {
          console.log("Source Page Tab does not exist anymore.");
        }
      });
    },

    getReactComponentTree: function () {
      return getBackgroundPage().getReactComponentTree();
    },

    getReactComponentMatrix: function () {
      return getBackgroundPage().getReactComponentMatrix();
    },

    getReactComponentChordArray: function () {
      return getBackgroundPage().getReactComponentChordArray();
    },

    messageBackground: function (msg, callback) {
      var self = this;
      //test
      console.log("message to background: ", msg);
      port.postMessage(msg);
      //background response
      port.onMessage.addListener(function(msg) {
        console.log("message recieved"+ msg);
        if (typeof(callback) === 'function') {
          callback(msg);
        }

        if (msg.type === 'reactComponentTree') {
          console.log("received reactComponentTree request");
          self.getReactComponentTree();
        }
      });
    }
};



module.exports = ExtensionUtils;