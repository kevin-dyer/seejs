(function () {
  console.log("This is the injected code!!!");

        //get all scripts
      var sourceCode = '',
          scriptFiles = document.getElementsByTagName('script'),
          filesLength = scriptFiles.length,
          ele,
          i,
          r = 0,
          requests = 0;

          code = sourceCode; //switch the source

      for (i = 0; i < filesLength; i++) {
        ele = scriptFiles[i];
        if (ele.innerHTML) {
          //console.log("innerHTML of script tag exists!, adding to sourceCode.");
          sourceCode += ele.innerHTML;

          //console.log("sourceCode so far: ", sourceCode);
        }else if (ele.getAttribute('src')) {
          //console.log("making get request to src: ", ele.getAttribute('src'));
          loadXMLDoc(ele.getAttribute('src'), function (data) {
            //console.log("get request successful, adding to sourceCode.");
            sourceCode += data;

            batchResponse(function (sourceCode) {
                console.log("scrip src = ", sourceCode.length);

                //window.postMessage({ type: "SOURCE_CODE", text: sourceCode }, "*");
                console.log("posting message");
                chrome.runtime.sendMessage({url: window.location.origin, sourceCode: sourceCode}, function(response) {
                  console.log("we have a response!: ", response);
                });
                //chrome.runtime.connect().postMessage({"sourceCode": sourceCode});
                
                // tree = esprima.parse(sourceCode, { range: true, loc: true});
                // console.log("esprima tree: ", tree);

                // //init function tree
                // functionTree = getFunctionTree(tree, code);
                // functionTree = setFunctionTreeDependencies(functionTree);
                // functionTree = addHiddenChildren(functionTree);
                // console.log("functionTree!!!, ", functionTree);
                // // BUBBLE
                // functionTree = convertToChildren(functionTree);
                // makeBubbleChart(functionTree);
            }, requests);
            //console.log("sourceCode so far: ", sourceCode);
          });
          requests++;
        }
      }

      function batchResponse (callback, requests) {
        //console.log("r = ", r, ", requests = ", requests);
        if (r === requests - 1) {
            //console.log("calling callback!!");
          callback(sourceCode);
        }else {
          r++;
        }
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
                success(xmlhttp.responseText);
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