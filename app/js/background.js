"use strict";
//TODO: wrap in closure
var sourceCode,
    fileList,
    inlineScriptList,
    codeTree,
    sourcePageTab,
    sourcePageUrl,
    visUrl,
    visTab;// = chrome.extension.getURL("bubble.html");

var testVar = "hello yall!";

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
      chrome.tabs.reload(existing_tab.id, null, function () {
        chrome.tabs.update(existing_tab.id, {"selected": true}, function (tab) {
          visTab = tab.id;
          console.log("visTab = ", visTab);
        });
      });
    } else {
      chrome.tabs.create({"url":url, "selected":true}, function (tab) {
        visTab = tab.id;
        console.log("visTab = ", visTab);
      });
    }
  });
}



//TODO: can remove sourceCode and sourcePageUrl globals via closure
function setSourceCode (source) {
  sourceCode = source;
}

function setSourcePageUrl (url) {
  sourcePageUrl = url;
}

//use sourceCode global
function buildCodeTree () {
  var tree,
      i,
      sourceLength = sourceCode.length, //TODO: adjust to only use checked scripts
      fileNode,
      tracer = window.esmorph.Tracer,
      code;
      // fileIndex = 0,
      // inlineScriptIndex = 0;

  codeTree = {name: "root", myChildren: [], parent: null, type: "root"};

  for (i = 0; i < sourceLength; i++) {

    // if (fileList && sourceCode[i].type === 'file' && !fileList[fileIndex++]) {
    //   continue;
    // } else if (inlineScriptList && sourceCode[i].type === 'inlineScript' && !inlineScriptList[inlineScriptIndex++]) {
    //   continue;
    // }

    if (!sourceCode[i].checked){
      //console.log("souceCode not checked!")
      continue;
    }

    code = sourceCode[i].code;

    console.log(i + ". Adding " + sourceCode[i].name);
    //console.log("building esprima tree");
    tree = esprima.parse(code, { range: true, loc: true});
    //console.log("building function tree");
    fileNode = tracer.getFunctionTree(tree, code, sourceCode[i]);
    fileNode.parent = codeTree;
    fileNode.sourceIndex = i; // may not be necessary
    //console.log("adding to main codeTree");
    codeTree.myChildren.push(fileNode);

    //TODO: add back in as option
    // TODO: modify addFunctionTrace to only use codeTree, or only use source, or 
    //console.log("modifying source code for tracing");
    //modifiedSource.push(tracer.addFunctionTrace(code, fileNode));
    console.log("completed adding " + sourceCode[i].name);
  }

  console.log("setting scopedList");
  codeTree = tracer.setScopedList(codeTree);

  //setDependencies(codeTree);

  console.log("Adding hidden children: ");
  codeTree = tracer.addHiddenChildren(codeTree);

  console.log("Setting unique id's: ");
  codeTree = tracer.setUniqueIds(codeTree);

  console.log("Converting to children");
  codeTree = tracer.convertToChildren(codeTree);

  //console.log("completed codeTree: ", codeTree);
}

function unminifySourceCode () {
  var i,
      opts = { indent_size: 2 };

  console.log("unminifying source code");

  for (i = 0; i < sourceCode.length; i++) {
    sourceCode[i].code = window.js_beautify(sourceCode[i].code, opts);
  }
}

//NOT USED
function setDependencies (codeTree) {
  console.log("setting dependencies");
  codeTree = tracer.setFunctionTreeDependencies(codeTree);
}

//TODO: use global sourceCode
function visualizeSourceCode () {
  chrome.browserAction.setIcon({path: 'app/images/red-icon.png'}, function () {
    buildCodeTree();
    chrome.browserAction.setIcon({path: 'app/images/blue-icon.png'}, function () {
      visUrl = chrome.extension.getURL("bubble.html");
      focusOrCreateTab(visUrl);
    });
  });
}

// function updateFileList (newFileList) {
//   fileList = newFileList;

//   //newFileList should contain [{key: checkedValue}]
// }

// function updateInlineScriptList (newInlineScriptList) {
//   inlineScriptList = newInlineScriptList;
// }

function addCheckValueToFiles () {
  sourceCode = sourceCode.map(function (script) {
    if (script.type === 'file') {
      script.checked = true;
    } else {
      script.checked = false;
    }

    return script;
  });
}

function updateSourceCode (script) {

  //console.log("updateSourceCode in background!");

  sourceCode = sourceCode.map(function (sourceItem) {
    if (sourceItem.uniqueKey === script.uniqueKey) {
      sourceItem.checked = script.checked;
    }

    return sourceItem;
  });

}

// TODO: need to use codeTree to build modified code rather than sourceCode,
// otherwise will have to recreate the codeTree to do this...
//
// function createModifiedSourceCode () {
//   var sourceLength = sourceCode.length,
//       i,
//       code,
//       modifiedSource = [];

//   for (i = 0; i < sourceLength; i++ ) {
//     code = sourceCode[i].code;
//     modifiedSource.push(tracer.addFunctionTrace(code, fileNode))
//   }
// }


function getScriptTags() {
  chrome.tabs.query({active: true, currentWindow: true}, function (tab) {
    var currentTab = tab[0].id;

    if (!sourcePageTab || (currentTab !== sourcePageTab && currentTab !== visTab)) {
      sourcePageTab = currentTab;
      chrome.browserAction.setIcon({path: 'app/images/red-icon.png'}, function () {
        chrome.tabs.executeScript(null, {
          file: 'app/js/get_script_tags.js'
        });
      });
    } else {
      sendScriptListToPopup();
    }

    if (!sourcePageTab) {
      sourcePageTab = currentTab;
    }
  });
}


//MESSAGING

//listen for response from injected script: get_script_tags.js
//NOTE: this is a one time message - OK
// chrome.runtime.onConnect.addListener(function(port) {
//   console.assert(port.name == "sourceCode");
//   port.onMessage.addListener(function(request) {
//     if (request.type === 'sourceCode') {
//       //set Global variables
//       setSourcePageUrl(request.url);
//       setSourceCode(request.sourceCode);
//       addCheckValueToFiles();

//       sendScriptListToPopup();

//       chrome.browserAction.setIcon({path: 'app/images/blue-icon.png'});
//     } 
//   });
// });


chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.type === 'sourceCode') {
      console.log("received sourceCode response!");
      //set Global variables
      setSourcePageUrl(request.url);
      setSourceCode(request.sourceCode);
      addCheckValueToFiles();
      sendScriptListToPopup();

      chrome.browserAction.setIcon({path: 'app/images/blue-icon.png'});
    }  
  }
);

function getScriptListForPopup () {
  return sourceCode.map(function (sourceItem) {
    return {
      uniqueKey: sourceItem.uniqueKey,
      name: sourceItem.name, 
      size: sourceItem.size, 
      type: sourceItem.type,
      checked: sourceItem.checked
    };
  });
}

function sendScriptListToPopup () {
  var scriptList = getScriptListForPopup(sourceCode);
  chrome.runtime.sendMessage({scriptList: scriptList, type: 'scriptList'}, function(response) {
    console.log("response from sendScriptListToPopup: ", response);
  });
}
  


//listen for popup page messages
chrome.extension.onConnect.addListener(function(port) {
  console.log("Connected ..... port sender: ", port.sender);
  port.onMessage.addListener(function(msg) {
    console.log("background got a message: ", msg);
    if (msg.type === "goAction") {
      port.postMessage("fired visualizeSourceCode");

      console.log("msg.settings: ", msg.settings);
      console.log("msg.settings.unminify: ", msg.settings.settings.unminify);
      if (msg.settings.settings.unminify){
        unminifySourceCode();
      }

      visualizeSourceCode();


      console.log("goAction recieved"+ msg);
      //respond to popup
      
    } else if (msg.type === 'updateSourceCode') {
      updateSourceCode(msg);
    // } else if (msg.type === "fileListUpdate") {
    //   console.log("fileList update recieved"+ msg);
    //   updateFileList(msg.fileList);
    //   port.postMessage("fired updateFileList");
    // } else if (msg.type === 'inlineScriptListUpdate') {
    //   console.log("inlineScript update recieved"+ msg);
    //   updateInlineScriptList(msg.inlineScriptList);
    //   port.postMessage("fired updateInlineScriptList");
    }
  });
});





// //tracer listener
// var initTrace = function () {
//   chrome.runtime.onConnect.addListener(function(port) {
//     if (port.name === 'webPort') {
//       port.onMessage.addListener(function(msg) {
//         if (msg.type === 'trace') {
//           //console.log("TRACE: ", msg);
//           if (traceQueue.length < queueLength) {
//             throttleQueue(msg);
//           }
//         }
//       })
//     }          
//   });

//   //Trace throttle
//   var traceQueue = [],
//       queueLength = 50,
//       busy = false,
//       waitTime = 100, //milliseconds between fireing
//       visPort = chrome.runtime.connect({name: "filteredTrace"});

//   function throttleQueue (msg) {
//     if (traceQueue.length < queueLength) {
//       traceQueue.push(msg);
      
//       if (!busy) {
//         busy = true;
//         startTimer(traceQueue);
//       }
//     }
//   }

//   function startTimer (traceQueue) {
//     setTimeout(function() {
//       console.log("sending message to VIS");
//       visPort.postMessage({type: "trace2", data: traceQueue.shift().data});
//       if (traceQueue.length > 0) {
//         startTimer(traceQueue);
//       } else {
//         busy = false;
//       }
//     }, waitTime);
//   }
// }


