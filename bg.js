function focusOrCreateTab(url) {
  chrome.windows.getAll({"populate":true}, function(windows) {
    var existing_tab = null;
    for (var i in windows) {
      var tabs = windows[i].tabs;
      for (var j in tabs) {
        var tab = tabs[j];
        if (tab.url == url) {
          existing_tab = tab;
          break;
        }
      }
    }
    if (existing_tab) {
      chrome.tabs.update(existing_tab.id, {"selected":true});
    } else {
      chrome.tabs.create({"url":url, "selected":true});
    }
  });
}

// chrome.browserAction.onClicked.addListener(function(tab) {
//   var manager_url = chrome.extension.getURL("manager.html");
//   focusOrCreateTab(manager_url);
// });

chrome.browserAction.onClicked.addListener(function(tab) {
  var popup_url = chrome.extension.getURL("popup.html");
      //content_script_url = chrome.extension.getURL("content_script.js");

      //console.log("content_script_url: ", content_script_url);
  focusOrCreateTab(popup_url);
  console.log("fired!");
  // chrome.tabs.create({'url': 'popup.html'}, function(tab) {
  //   console.log("tab is created!");
  // });

  chrome.tabs.executeScript(tab.id, {
    file: 'content_script.js'
    //file: content_script_url
  });
});



chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    var codeTree,
        views = chrome.extension.getViews(),
        myWindow = views[views.length - 1];
        //myWindow = views[1];

        console.log("views: ", views);
    
    console.log("back end recieved source code: ", request);
    //myWindow.UTILS.showLoader();
    
    
    console.log("running esmorph on it");

    //var extensionId = chrome.runtime.id;
    
    codeTree = myWindow.runEsmorph(request.sourceCode);
    console.log("codeTree in background: ", codeTree);

    console.log("making bubble chart");
    myWindow.UTILS.updateLoaderStatus("Making Bubble Chart");
    
    myWindow.makeBubbleChart(codeTree);

    myWindow.UTILS.hideLoader();

// console.log("show popup.html (background page)");
// chrome.tabs.create({url: chrome.extension.getURL('popup.html')});

    if (request){
      sendResponse({farewell: "goodbye"});
    }
  });