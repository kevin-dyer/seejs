(function () {
  console.log("This is the injected code!!!");

        //get all scripts
      var sourceCode = [],
          scriptFiles = document.getElementsByTagName('script'),
          filesLength = scriptFiles.length,
          // ele,
          // eleSrc,
          // eleHTML,
          i,
          r = 0,
          requests = 0;

          //code = sourceCode; //switch the source

      for (i = 0; i < filesLength; i++) {
        var ele = scriptFiles[i],
            eleSrc = ele.getAttribute('src'),
            eleHTML = ele.innerHTML;

        if (eleHTML) {
          sourceCode.push({name: "Inline Script", size: eleHTML.length, type: "inlineScript", code: eleHTML});
        }else if (eleSrc) {
          loadXMLDoc(eleSrc, function (responseCode, url) {
            sourceCode.push({name: url, size: responseCode.length, type: "file", code: responseCode});
            batchResponse(sourceCode, sendMessage, requests);
          });
          requests++;
        }
      }

      function batchResponse (sourceCode, callback, requests) {
        if (r === requests - 1) {
          callback(sourceCode);
        }else {
          r++;
        }
      }

      function sendMessage (sourceCode) {
        chrome.runtime.sendMessage({url: window.location.href, sourceCode: sourceCode}, function(response) {
          console.log("Background response: ", response);
        });
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
              if (typeof faulure === 'function') {
                faulure(xmlhttp.responseText);
              }
           }
           else {
              console.error('something else other than 200 was returned');
              if (typeof faulure === 'function') {
                faulure(xmlhttp.responseText);
              }
           }
        }
    }

    xmlhttp.open("GET", url, true);
    xmlhttp.send();
  }

})();