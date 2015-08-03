(function () {
  console.log("SeeJS TRACER injection");

  var sourceCode = [],
      scriptFiles = document.getElementsByTagName('script'),
      filesLength = scriptFiles.length,
      i,
      r = 0,
      requests = 0,
      ele,
      eleScr,
      eleHTML;

      console.log("script files length: ", filesLength);

  //TODO:remove
    var x = document.createElement("SCRIPT");
          var t = document.createTextNode("window.hi = function() {alert('hia')}");
          x.appendChild(t);
          document.body.appendChild(x);

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
          console.log("replacing script: ", url);
          // sourceCode.push({name: url, size: responseCode.length, type: "file", code: responseCode});
          // batchResponse(sourceCode, sendMessage, requests);
          //ele.setAttribute('src', '');
          //ele.innerHTML = responseCode;
          //ele.innerHTML = "hey there";

          var x = document.createElement("SCRIPT");
          var t = document.createTextNode(responseCode);
          x.appendChild(t);
          document.body.appendChild(x);

          removejscssfile(url, 'js');

          //ele.parentElement.removeChild(ele);

          //document.getElementsByTagName("head")[0].removeChild(ele);
        },
        function(responseCode) {
          // if (r === requests - 1) {
          //   callback(sourceCode);
          // }else {
          //   r++;
          // }
        });
      requests++;
    }
  }

  //test
  function removejscssfile(filename, filetype){
    var targetelement=(filetype=="js")? "script" : (filetype=="css")? "link" : "none" //determine element type to create nodelist from
    var targetattr=(filetype=="js")? "src" : (filetype=="css")? "href" : "none" //determine corresponding attribute to test for
    var allsuspects=document.getElementsByTagName(targetelement)
    for (var i=allsuspects.length; i>=0; i--){ //search backwards within nodelist for matching elements to remove
    if (allsuspects[i] && allsuspects[i].getAttribute(targetattr)!=null && allsuspects[i].getAttribute(targetattr).indexOf(filename)!=-1)
        allsuspects[i].parentNode.removeChild(allsuspects[i]) //remove element by calling parentNode.removeChild()
    }
  }


  //TODO: TEST
  // for (i = 0; i < filesLength; i++) {
  //   ele = scriptFiles[i],
  //   // eleSrc = ele.getAttribute('src'),
  //   // eleHTML = ele.innerHTML;

  //   ele.setAttribute('src', '');

  // }


  // function batchResponse (sourceCode, callback, requests) {
  //   if (r === requests - 1) {
  //     callback(sourceCode);
  //   }else {
  //     r++;
  //   }
  // }

  // function sendMessage (sourceCode) {
  //   chrome.runtime.sendMessage({url: window.location.href, sourceCode: sourceCode}, function(response) {
  //     console.log("Background response: ", response);
  //   });
  // }

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

})();