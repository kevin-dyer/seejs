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
      eleHTML;

  for (i = 0; i < filesLength; i++) {
    ele = scriptFiles[i],
    eleSrc = ele.getAttribute('src'),
    eleHTML = ele.innerHTML;

    if (eleHTML) {
      //TODO: add extention option to include/exclude inline scripts
      //sourceCode.push({name: "Inline Script", size: eleHTML.length, type: "inlineScript", code: eleHTML});
    }else if (eleSrc) {
      loadXMLDoc(eleSrc, 
        function (responseCode, url) {
          sourceCode.push({name: url, size: responseCode.length, type: "file", code: responseCode});
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

    //TODO: test
    //unset src attribute (try to prevent loading)
    //ele.setAttribute('src', '');
  }


  //TODO: TEST
  // for (i = 0; i < filesLength; i++) {
  //   ele = scriptFiles[i],
  //   // eleSrc = ele.getAttribute('src'),
  //   // eleHTML = ele.innerHTML;

  //   ele.setAttribute('src', '');

  // }


  function batchResponse (sourceCode, callback, requests) {
    if (r === requests - 1) {
      callback(sourceCode);
    }else {
      r++;
    }
  }

  function sendMessage (sourceCode) {
    chrome.runtime.sendMessage({url: window.location.href, sourceCode: sourceCode, type: 'sourceCode'}, function(response) {
      console.log("Background response: ", response.length);

      //TODO: add script tag to the bottom of the body to replace sourcecode
      //remove old script tags
      sourceCode.forEach(function(sr) {
        console.log("removing old script tag: ", sr.name);
        removejscssfile(sr.name, 'js');
      });

      var x = document.createElement("SCRIPT");
      var t = document.createTextNode(response);
      x.appendChild(t);
      document.body.appendChild(x);

    });
  }

  //this is NOT visible by content window
  global.traceStart = function (uniqueId) {
    console.log("called function: ", uniqueId);
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
               //document.getElementById("myDiv").innerHTML = xmlhttp.responseText;
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

  function removejscssfile (filename, filetype) {
    var targetelement=(filetype=="js")? "script" : (filetype=="css")? "link" : "none" //determine element type to create nodelist from
    var targetattr=(filetype=="js")? "src" : (filetype=="css")? "href" : "none" //determine corresponding attribute to test for
    var allsuspects=document.getElementsByTagName(targetelement)
    for (var i=allsuspects.length; i>=0; i--){ //search backwards within nodelist for matching elements to remove
    if (allsuspects[i] && allsuspects[i].getAttribute(targetattr)!=null && allsuspects[i].getAttribute(targetattr).indexOf(filename)!=-1)
        allsuspects[i].parentNode.removeChild(allsuspects[i]) //remove element by calling parentNode.removeChild()
    }
  }

  var port;// = chrome.runtime.connect({name: "traceport"});
  window.addEventListener("message", function(event) {
    port = chrome.runtime.connect({name: "traceport"});;
    // We only accept messages from ourselves
    if (event.source != window)
      return;

    if (event.data.type && (event.data.type === "TARGET_PAGE")) {
      console.log("Content script received: " + event.data.uniqueId);
      port.postMessage({type: "trace", data: event.data});
    }
  }, false);




})(window);