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

chrome.browserAction.onClicked.addListener(function(tab) {
  var popup_url = chrome.extension.getURL("popup.html");

      //console.log("content_script_url: ", content_script_url);
  focusOrCreateTab(popup_url);

  chrome.tabs.executeScript(tab.id, {
    file: 'content_script.js'
  });
});

  



chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    var codeTree,
        views = chrome.extension.getViews(),
        myWindow = views[views.length - 1],
        i,
        sourceLength = request.sourceCode.length,
        fileNode;
    
    console.log("back end recieved source code: ", request);

    myWindow.document.getElementsByClassName('webpage-title')[0].innerHTML = request.url;
    
    
    console.log("running esmorph on it");
    myWindow.UTILS.updateLoaderStatus("Creating FunctionTree...");

    //var extensionId = chrome.runtime.id;
    codeTree = {name: "root", children: [], dependencies: [], parent: null, type: "root"};
    
    //TODO: run bubble update func as each src is processed
    for (i = 0; i < sourceLength; i++) {
      console.log(i + ". Adding " + request.sourceCode[i].name);
      myWindow.UTILS.updateLoaderStatus("Adding " + request.sourceCode[i].name);
      fileNode = myWindow.runEsmorph(request.sourceCode[i]);
      fileNode.parent = codeTree;
      codeTree.children.push(fileNode);
    }
    // codeTree = myWindow.runEsmorph(request.sourceCode);
    console.log("codeTree in background: ", codeTree);

    //console.log("making bubble chart");
    myWindow.UTILS.updateLoaderStatus("Making Bubble Chart");

    myWindow.makeBubbleChart(codeTree, request.sourceCode.map(function(c) {return c.code}).join(''));

    myWindow.UTILS.hideLoader();

    myWindow.document.getElementById('editor').style.display = "inline-block";

// console.log("show popup.html (background page)");
// chrome.tabs.create({url: chrome.extension.getURL('popup.html')});

    if (request){
      sendResponse({status: 200});
    }
  });