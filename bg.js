var codeTree,
    pageUrl;

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

  chrome.browserAction.setIcon({path: 'red.png'});

  chrome.tabs.executeScript(tab.id, {
    file: 'content_script.js'
  });
});

  


chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    var tree,
        i,
        sourceCode = request.sourceCode,
        sourceLength = sourceCode.length,
        fileNode,
        tracer = window.esmorph.Tracer,
        code,
        popup_url = chrome.extension.getURL("popup.html");

    

    //console.log("back end recieved source code: ", request);

    pageUrl = request.url;

    codeTree = {name: "root", myChildren: [], parent: null, type: "root"};

    for (i = 0; i < sourceLength; i++) {
      code = sourceCode[i].code;
      console.log(i + ". Adding " + sourceCode[i].name);

      tree = esprima.parse(code, { range: true, loc: true});
      fileNode = tracer.getFunctionTree(tree, code, sourceCode[i]);
      fileNode.parent = codeTree;
      codeTree.myChildren.push(fileNode);
    }

    console.log("setting scopedList: ");
    codeTree = tracer.setScopedList(codeTree);

    console.log("setting dependencies");
    codeTree = tracer.setFunctionTreeDependencies(codeTree);

    console.log("Adding hidden children: ");
    codeTree = tracer.addHiddenChildren(codeTree);

    console.log("Setting unique id's: ");
    codeTree = tracer.setUniqueIds(codeTree);

    console.log("Converting to children");
    codeTree = tracer.convertToChildren(codeTree);


    focusOrCreateTab(popup_url);
    
    if (request){
      sendResponse({status: 200});
    }

    chrome.browserAction.setIcon({path: 'blue-icon.png'});
  });