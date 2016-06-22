"use strict";
//TODO: wrap in closure
var sourceCode,
    fileList,
    inlineScriptList,
    codeTree,
    sourcePageTab,
    sourcePageUrl,
    visUrl,
    visTab,// = chrome.extension.getURL("bubble.html");
    reactRoot,
    reactComponents;

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
    console.log("esprima tree: ", tree);
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
  //codeTree = tracer.setScopedList(codeTree);

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
      opts = { indent_size: 2, jslint_happy: true };

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

function updateMultipleScripts (msg) {
  msg.scriptList.forEach(updateSourceCode);
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

function getReactComponentMatrix () {
  if (!reactComponents) {
    reactComponents = getReactComponents();
  }

  var i,
      j,
      componentsLength = reactComponents.length,
      comp1,
      comp2,
      dependentMatrix = [],
      row = [];

  console.log("reactComponents: ", reactComponents);
  for (i = 0; i < componentsLength; i++) {
    comp1 = reactComponents[i];
    row = [];
    for (j = 0; j < componentsLength; j++) {
      comp2 = reactComponents[j];
      console.log("")
      //dependentMatrix[i][j] = !componentIsUnique(comp2, comp1.dependents) ? 1 : 0;
      row.push(!componentIsUnique(comp2, comp1.dependents) ? 1 : 0);
    }
    dependentMatrix[i] = row;
  }

  console.log("dependentMatrix: ", dependentMatrix);
  return dependentMatrix;
}

function getReactComponentChordArray () {
  if (!reactComponents) {
    reactComponents = getReactComponents();
  }

  var i,
      j,
      componentsLength = reactComponents.length,
      comp,
      dep,
      chordArray = [];
      //row = [];

  console.log("reactComponents: ", reactComponents);
  for (i = 0; i < componentsLength; i++) {
    comp = reactComponents[i];
    //row = [];
    for (j = 0; j < comp.dependents.length; j++) {
      dep = comp.dependents[j];
      //dependentMatrix[i][j] = !componentIsUnique(comp2, comp1.dependents) ? 1 : 0;
      //row.push(!componentIsUnique(comp2, comp1.dependents) ? 1 : 0);
      chordArray.push({
        component: comp.name,
        dependentcy: dep.name,
        count: 1
      });
    }
  }

  console.log("chordArray: ", chordArray);
  return chordArray;
}


//TODO: move to another module:
function getReactComponentTree () {
  var components = getReactComponents();

  reactRoot = {
    children: getReactFileNodes(components, reactRoot),
    name: 'root',
    parent: null,
    size: 1,
    type: 'root',
    uniqueId: UTILS.getId()
  };

  console.log("react component tree: ", reactRoot);
  //sendVistMessage({type: 'reactComponentTree', reactRoot});

  return reactRoot;
}

function getReactComponents () {
  var tree,
      i,
      sourceLength = sourceCode.length, //TODO: adjust to only use checked scripts
      fileNode,
      tracer = window.esmorph.Tracer,
      traverse = tracer.traverse,
      Syntax = tracer.Syntax,
      code,
      parsedComponent,
      componentNode,
      reactComponents = [];

  for (i = 0; i < sourceLength; i++) {

    if (!sourceCode[i].checked){
      //console.log("souceCode not checked!")
      continue;
    }

    code = sourceCode[i].code;

    console.log(i + ". Adding " + sourceCode[i].name);
    tree = esprima.parse(code, { range: true, loc: true});
    //console.log("esprima tree: ", tree);
    
    traverse(tree, function (element, path) {
      if (element && element.callee && element.callee.property && element.callee.property.name === 'createClass' && element.arguments && element.arguments[0] && element.arguments[0].type === Syntax.ObjectExpression) {
        parsedComponent = element.arguments[0];
        componentNode = createReactComponentNode(parsedComponent, sourceCode[i]);
        reactComponents.push(componentNode);
      }
    });
    //console.log("completed adding " + sourceCode[i].name);
  }

  //TODO: send in different call
  //console.log("setting component dependencies... reactComponents: ", reactComponents);
  reactComponents = setComponentDependencies(reactComponents);

  console.log("React components: ", reactComponents);

  return reactComponents;
}

function createReactComponentNode (parsedComponent, sourceScript) {
  var componentNode;

  componentNode = {
    name: getComponentName(parsedComponent),
    script: sourceScript, //might pair this down
    range: parsedComponent.range, //used for size/value
    uniqueId: sourceScript.uniqueKey + '-' + parsedComponent.range[0] + '-' + parsedComponent.range[1],
    parsedComponent: parsedComponent,
    dependents: [], //fill when have references to all the components
    type: 'reactComponent'
    //children: addComponentProps(componentNode)
  };
  componentNode = addComponentProps(componentNode);
  //console.log("componentNode.children: ", componentNode.children);

  return componentNode;
}

function getComponentName (parsedComponent) {
  var i,
      properties = parsedComponent.properties,
      propsLength = properties.length,
      prop;

  for (i = 0; i < propsLength; i++) {
    prop = properties[i];
    if (prop && prop.key && prop.key.name === 'displayName') {
      return prop.value.value;
    }
  }
  return null;
}

function setComponentDependencies (components) {
  var tracer = window.esmorph.Tracer,
      traverse = tracer.traverse,
      Syntax = tracer.Syntax;


  return components.map(function (component) {
    var dependent;

    console.log("component: ", component);
    traverse(component.parsedComponent, function (element, path) {
      if (element.type === Syntax.CallExpression && element.callee && element.callee.property && element.callee.property.name === 'createElement' && element.arguments && element.arguments[0] && element.arguments[0].name) {
        //element.arguments[0].value  === name of component - match to component.name of others
        console.log("finding component by name: ", element.arguments[0].name);
        dependent = findComponentByName(element.arguments[0].name, components);
        if (dependent && componentIsUnique(dependent, component.dependents)) {
          component.dependents.push(dependent);
        }
      }
    });
    return component;
  });
}

function findComponentByName (componentName, components) {
  var i,
      componentsLength = components.length,
      component;

  for (i = 0; i < componentsLength; i++) {
    component = components[i];
    if (component.name === componentName) {
      return component;
    }
  }
  return null;
}

function componentIsUnique(component, components) {
  return components.map(function (comp) {return comp.name}).indexOf(component.name) === -1;
}

function scriptIsUnique(script, scripts) {
  return scripts.map(function (scrp) { return scrp.uniqueKey}).indexOf(script.uniqueKey) === -1;
}

function getReactFileNodes (components, reactRoot) {
  var files = [],
      i,
      componentsLength = components.length,
      component,
      script;

  for(i = 0; i < componentsLength; i++) {
    component = components[i];
    //console.log("component (in getReactFileNodes: ", component);
    script = component.script;
    if (script.uniqueKey && scriptIsUnique(script, files)) {
      files.push(createReactFileNode(script, reactRoot, components));
    }
  }

  //files = addComponentsToFiles(files, components);


  return files;
}

function createReactFileNode(script, reactRoot, components) {
  var reactFileNode;

  reactFileNode = {
    name: script.name,
    parent: reactRoot,
    sourceIndex: script.uniqueKey,
    type: script.type, //change all of these to just script
    code: script.code,
    uniqueKey: script.uniqueKey,
    uniqueId: 's' + script.uniqueKey, // ???
    size: script.code.length,
    sourceCode: script.code
  };
  reactFileNode.children = addComponentsToFile(reactFileNode, components);

  return reactFileNode;
}

// function addComponentsToFiles (files, components) {
//   var i,
//       componentsLength = components.length,
//       component;

//   return files.map(function (file) {
//     file.children = [];
//     for (i = 0; i < componentsLength; i++) {
//       component = components[i];
//       if (component.script.uniqueKey === file.uniqueKey) {
//         component.parent = file;
//         file.children.push(component);
//       }
//     }
//     return file;
//   });
// }

function addComponentsToFile (file, components) {
  var i,
      componentsLength = components.length,
      component,
      children = [];

  console.log("adding components to file!");
  for (i = 0; i < componentsLength; i++) {
    component = components[i];
    console.log("component.script", component.script, ", file.uniqueKey: ", file);
    if (component.script.uniqueKey === file.uniqueKey) {
      component.parent = file;
      children.push(component);
    }
  }
  return children;
}

function addComponentProps (componentNode) {
  var i,
      properties = componentNode.parsedComponent.properties,
      propsLength = properties.length,
      prop,
      propNode,
      tracer = window.esmorph.Tracer,
      Syntax = tracer.Syntax;

  componentNode.children = [];

  //for reference
  // componentNode = {
  //   name: getComponentName(parsedComponent),
  //   script: sourceScript, //might pair this down
  //   range: parsedComponent.range, //used for size/value
  //   uniqueId: sourceScript.uniqueKey + '-' + parsedComponent.range[0] + '-' + parsedComponent.range[1],
  //   parsedComponent: parsedComponent,
  //   dependents: [], //fill when have references to all the components
  //   children: addComponentProps(componentNode)
  // };

  for (i = 0; i < propsLength; i++) {

    prop = properties[i];

    console.log("add component prop: ", prop);

    propNode = {
      name: prop.key.name,
      parent: componentNode,
      loc: prop.loc,
      range: prop.range,
      size: prop.range[1] - prop.range[0],
      treeNode: prop,
      uniqueId: componentNode.script.uniqueKey + '-' + prop.range[0] + '-' + prop.range[1],
      type: 'property',
      myChildren: []
    };

    // var functionTree = {
    //             name: sourceCode.name || 'noName',
    //             parent: null,
    //             myChildren: [],
    //             treeNode: node,
    //             type: sourceCode.type,
    //             sourceCode: sourceCode.code
    //         };
    //     createFunctionTree(node, code, functionTree);
    //    return functionTree;
    if (propNode.value && propNode.value.type === Syntax.FunctionExpression) {
      //create function tree for this property
      //fileNode = tracer.getFunctionTree(prop, code, sourceCode[i]);
      // fileNode.parent = codeTree;
      // fileNode.sourceIndex = i; // may not be necessary
      // codeTree.myChildren.push(fileNode);

      // var functionTree = {
      //   name: propNode.name,
      //   parent: propNode,
      //   myChildren: [],
      //   treeNode: prop,

      // }

      //try making with just these two arguments...
      propNode.myChildren = createPropFunctionTree(prop, componentNode.script);
      console.log("propNode.myChildren: ", propNode.myChildren); // check if its an array

    }

    componentNode.children.push(propNode);
  }
  return componentNode;
}

//returns list of functions (no root node)
function createPropFunctionTree (propTree, sourceScript) {
  //TODO: make function tree so that the propNode is the rootNode, so the function Tree starts at its children...
  var functionTree = {
    name: propTree.key.name,
    myChildren: []
  };

  window.esmorph.Tracer.createFunctionTree(propTree, sourceScript.code, functionTree);
  return functionTree;
}

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
      preview: sourceItem.type === 'inlineScript' ? getSouceCodePreview(sourceItem.code, 250) : null,
      checked: sourceItem.checked
    };
  });
}

function getSouceCodePreview (code, maxLength) {
  var preview = code.slice(0, maxLength);

  if (code.length > maxLength) {
    preview += '...';
  }

  return preview;
}

function sendScriptListToPopup () {
  var scriptList = getScriptListForPopup(sourceCode);
  chrome.runtime.sendMessage({scriptList: scriptList, type: 'scriptList'}, function(response) {
    console.log("response from sendScriptListToPopup: ", response);
  });
}

function sendVistMessage (message) {
  chrome.runtime.sendMessage(message, function (response) {
    console.log("response from sendVisMessage: ", response);
  });
}
  


//listen for popup page messages
chrome.extension.onConnect.addListener(function(port) {
  console.log("Connected ..... port sender: ", port.sender);
  port.onMessage.addListener(function(msg) {
    console.log("background got a message: ", msg);
    if (msg.type === 'getScriptTags') {
      getScriptTags();
    } else if (msg.type === "goAction") {
      port.postMessage("fired visualizeSourceCode");

      console.log("msg settings: ", msg.settings);

      if (msg.settings && msg.settings.unminify){
        unminifySourceCode();
      }

      visualizeSourceCode();


      console.log("goAction recieved"+ msg);
      //respond to popup
      
    } else if (msg.type === 'updateSourceCode') {
      updateSourceCode(msg);
    } else if (msg.type === 'updateMultipleScripts') {
      updateMultipleScripts(msg);
    } else if (msg.type === 'getReactComponentTree') {
      getReactComponentTree();
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


