(function (global) {
  console.log("SeeJS code injection");

  var sourceCode = [],
      scriptFiles = document.getElementsByTagName('script'),
      filesLength = scriptFiles.length,
      i,
      r = 0,
      requests = 0,
      ele,
      eleScr,
      eleHTML,
      uniqueKey = 0,
      hasAjaxContent,
      inlineIndex = 0;

  for (i = 0; i < filesLength; i++) {
    ele = scriptFiles[i],
    eleSrc = ele.getAttribute('src'),
    eleHTML = ele.innerHTML;
    console.log("processing Ele: ", eleSrc);
    if (eleHTML) {
      sourceCode.push({uniqueKey: uniqueKey++, name: "Inline Script " + ++inlineIndex, size: eleHTML.length, type: "inlineScript", code: eleHTML});
    } else if (eleSrc) {
      hasAjaxContent = true;
      loadXMLDoc(eleSrc, 
        function (responseCode, url) {
          sourceCode.push({uniqueKey: uniqueKey++, name: url, size: responseCode.length, type: "file", code: responseCode});
          batchResponse(sourceCode, sendMessage, requests);
        },
        function(responseCode) {
          if (r === requests - 1) {
            callback(sourceCode);
          }else {
            r++;
          }
        });
      requests++;
    }
  }

  //if only inline scripts
  if (!hasAjaxContent) {
    sendMessage(sourceCode);
  }

  function batchResponse (sourceCode, callback, requests) {
    if (r === requests - 1) {
      callback(sourceCode);
    }else {
      r++;
    }
  }

  function sendMessage (sourceCode) {
    chrome.runtime.sendMessage({url: window.location.href, sourceCode: sourceCode, type: 'sourceCode'}, function(response) {});
    //var port = chrome.runtime.connect({name: "sourceCode"});
    //
    //port.postMessage({url: window.location.href, sourceCode: sourceCode, type: 'sourceCode'});
      // var d, x, t;

      // //TODO: add script tag to the bottom of the body to replace sourcecode
      // //remove old script tags
      // sourceCode.forEach(function(sr) {
      //   console.log("removing old script tag: ", sr.name);
      //   //TODO: add back when ready
      //   //removejscssfile(sr.name, 'js');
      // });

      // d = document.createElement("DIV");
      // response.forEach(function(fileText) {
      //   //TODO: add back when ready
      //   // x = document.createElement("SCRIPT");
      //   // t = document.createTextNode(fileText);
      //   // x.appendChild(t);
      //   // d.appendChild(x);
      // });
      // document.body.appendChild(d);
  }

  function loadXMLDoc(url, success, failure) {
    var xmlhttp;

    if (window.XMLHttpRequest) {
        // code for IE7+, Firefox, Chrome, Opera, Safari
        xmlhttp = new XMLHttpRequest();
    } else {
        // code for IE6, IE5
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }

    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == XMLHttpRequest.DONE ) {
           if(xmlhttp.status == 200){
              if (typeof success === 'function') {
                success(xmlhttp.responseText, url);
              }
           }
           else if(xmlhttp.status == 400) {
              console.error('There was an error 400');
              if (typeof failure === 'function') {
                failure(xmlhttp.responseText);
              }
           }
           else {
              console.error('something else other than 200 was returned');
              if (typeof failure === 'function') {
                failure(xmlhttp.responseText);
              }
           }
        }
    }

    xmlhttp.open("GET", url, true);
    xmlhttp.send();
  }

  // function removejscssfile (filename, filetype) {
  //   var targetelement=(filetype=="js")? "script" : (filetype=="css")? "link" : "none" //determine element type to create nodelist from
  //   var targetattr=(filetype=="js")? "src" : (filetype=="css")? "href" : "none" //determine corresponding attribute to test for
  //   var allsuspects=document.getElementsByTagName(targetelement)
  //   for (var i=allsuspects.length; i>=0; i--){ //search backwards within nodelist for matching elements to remove
  //   if (allsuspects[i] && allsuspects[i].getAttribute(targetattr)!=null && allsuspects[i].getAttribute(targetattr).indexOf(filename)!=-1)
  //       allsuspects[i].parentNode.removeChild(allsuspects[i]) //remove element by calling parentNode.removeChild()
  //   }
  // }



  // //TODO: move to separate content script that is injected when the throttle button is clicked
  // //Trace throttle
  // var traceQueue = [],
  //     queueLength = 50,
  //     busy = false,
  //     waitTime = 100, //milliseconds between fireing
  //     //visPort = chrome.runtime.connect({name: "filteredTrace"});
  //     port = chrome.runtime.connect({name: "filteredTrace"});

  // function throttleQueue (msg) {
  //   if (traceQueue.length < queueLength) {
  //     traceQueue.push(msg);
      
  //     if (!busy) {
  //       busy = true;
  //       startTimer(traceQueue);
  //     }
  //   }
  // }

  // function startTimer (traceQueue) {
  //   setTimeout(function() {
  //     port = chrome.runtime.connect({name: "filteredTrace"}); // TODO: redundant, but throws error without
  //     //console.log("sending message to VIS");
  //     //console.log("port: ", port);
  //     port.postMessage({type: "trace2", data: traceQueue.shift().data});
  //     if (traceQueue.length > 0) {
  //       startTimer(traceQueue);
  //     } else {
  //       busy = false;
  //     }
  //   }, waitTime);
  // }

  // window.addEventListener("message", function(event) {
  //   //var port = chrome.runtime.connect({name: "webPort"});
  //   // only accept messages from ourselves
  //   if (event.source != window)
  //     return;

  //   if (event.data.type && (event.data.type === "TARGET_PAGE")) {

  //     if (traceQueue.length < queueLength) {
  //       throttleQueue(event);
  //     }
  //     //port.postMessage({type: "trace", data: event.data});
  //   }
  // }, false);



})(window);