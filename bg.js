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

    if (request.type === 'sourceCode') {
      var tree,
          i,
          sourceCode = request.sourceCode,
          sourceLength = sourceCode.length,
          fileNode,
          tracer = window.esmorph.Tracer,
          code,
          popup_url = chrome.extension.getURL("popup.html"),
          modifiedSource = '';

      pageUrl = request.url;

      codeTree = {name: "root", myChildren: [], parent: null, type: "root"};

      for (i = 0; i < sourceLength; i++) {
        code = sourceCode[i].code;

        console.log(i + ". Adding " + sourceCode[i].name);

        tree = esprima.parse(code, { range: true, loc: true});
        fileNode = tracer.getFunctionTree(tree, code, sourceCode[i]);
        fileNode.parent = codeTree;
        fileNode.sourceIndex = i; // may not be necessary
        codeTree.myChildren.push(fileNode);

        modifiedSource += tracer.addFunctionTrace(code, fileNode);
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

      console.log("opening visualization page");

      focusOrCreateTab(popup_url);
      
      if (request){
        sendResponse(modifiedSource);
      }

      chrome.browserAction.setIcon({path: 'blue-icon.png'});
    }

    chrome.runtime.onConnect.addListener(function(port) {
      console.assert(port.name === 'traceport');
      port.onMessage.addListener(function(msg) {
        if (msg.type === 'trace') {
          console.log("TRACE: ", msg);
        }
      })
    })
  });