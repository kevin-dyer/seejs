// chrome.browserAction.onClicked.addListener(function(tab) {
//   // No tabs or host permissions needed!
//   console.log('Turning ' + tab.url + ' red!');
//   chrome.tabs.executeScript({
//     file: 'content_script.js'
//   });
// });


console.log("background");

chrome.tabs.executeScript({
    file: 'content_script.js'
  });


chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    var codeTree;
    
    console.log("back end recieved source code: ", request);
    
    if (request){
      sendResponse({farewell: "goodbye"});
    }
    console.log("running esmorph on it");

    //var extensionId = chrome.runtime.id;
    var myWindow = chrome.extension.getViews({type: "popup"})[0];
    codeTree = myWindow.runEsmorph(request.sourceCode);
    console.log("codeTree in background: ", codeTree);

    console.log("making bubble chart");
    makeBubbleChart(codeTree);

// console.log("show popup.html (background page)");
// chrome.tabs.create({url: chrome.extension.getURL('popup.html')});

    sendResponse({farewell: "goodbye"});
  });