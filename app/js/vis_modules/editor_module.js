var CircleUtils = require('./circle_module.js'),
    TreeUtils = require('./tree_module.js');

var editor = ace.edit("editor"), //TODO: need to require ace module
    currentEditorNode,
    currentEditorLoc,
    showEditor = false;

    //TODO: create initializer for editor, make resize method, and setAnimated scroll method (or just put that one in the init function)

var EditorUtils = {
  initEditor: function () {
    editor = ace.edit("editor");
    editor.resize(true);
    editor.setAnimatedScroll(true);
    initEditorClickListener();
    initResizableEditorWrapper();
  },

  setEditorContents: function (d) {
    var parent,
        range,
        code;

    if (d.treeNode) {
          range = d.treeNode.range;

      parent = TreeUtils.getParentFile(d);

      if (!currentEditorNode || parent.uniqueId !== currentEditorNode.uniquId) {
        editor.setValue(parent.sourceCode);
        currentEditorNode = parent;
      }
      currentEditorLoc = d.treeNode && d.treeNode.loc ? d.treeNode.loc.start : {line:0, column: 0};

      if (showEditor) {
        positionEditor();
      }
    }
  },

  positionEditor: positionEditor,

  getCurrentEditorNode: function () {
    return currentEditorNode;
  },

  setCurrentEditorNode: function (d) {
    currentEditorNode = d;
  },

  getCurrentEditorLoc: function () {
    return currentEditorLoc;
  },

  setCurrentEditorLoc: function (d) {
    currentEditorLoc = d;
  },

  showCode: showCode,

  hideCode: hideCode,

  toggleCode: toggleCode

};

function positionEditor () {
  if (currentEditorLoc) {
    editor.resize(true);
    editor.gotoLine(currentEditorLoc.line, currentEditorLoc.column, true);
  }
}

function showCode () {
  $('#side-bar').fadeIn().height($('.bubble-chart').height());
  positionEditor();
  showEditor = true;
}

function hideCode () {
  $("#side-bar").fadeOut();
  showEditor = false;
}

function toggleCode () {
  if (showEditor) {
    hideCode();
  } else {
    showCode();
  }
}




//private methods
function initEditorClickListener () {
  $("#editor").click(function () {
    var position = editor.getCursorPosition();

    //TODO: move Edit Session into init method...
    var cursorIndex = getCursorIndex();

    var selectedCircle = getNodeFromEditorPosition(cursorIndex);
    CircleUtils.highlightCircle(selectedCircle);
  });
}

//TODO: can I create this new EditSession once and just update the value?
function getCursorIndex () {
  return new ace.EditSession(editor.getValue()).getDocument().positionToIndex(position);
}

function getNodeFromEditorPosition (cursorIndex) {
  var smallestNode = findSmallestWrappingNode(cursorIndex, currentEditorNode);
  
  if (smallestNode) {
    return $("#n" + smallestNode.uniqueId)[0];
  } 
  console.log("smallestNode does NOT exist");
}

function findSmallestWrappingNode (cursorIndex, tmpNode) {
  var tmpChildren = tmpNode.children,
      tmpChild;

  if (!tmpChildren || !tmpChildren.length) {
    return tmpNode;
  }

  for(var i=0, l = tmpChildren.length; i < l; i++) {
    tmpChild = tmpChildren[i];
    if (insideNode(cursorIndex, tmpChild)) {
      tmpNode = findSmallestWrappingNode(cursorIndex, tmpChild);
      break;
    }
  }
  return tmpNode;
}

//returns boolean if current position is inside node
function insideNode (cursorIndex, testNode) {
  var treeNode = testNode.treeNode,
      range = treeNode ? treeNode.range : null,
      start,
      end;

  if (range) {
    start = range[0];
    end = range[1];
    if (start <= cursorIndex && end >= cursorIndex) {
      return true;
    }
  }

  return false;
}

// function initEditorNavigation () {
//   $('.show-code').click(EditorUtils.toggleCode);
//   $(".close-editor-button").click(EditorUtils.hideCode);
// }

function initResizableEditorWrapper () {
  $( ".editor-wrapper" ).resizable({
      handles: 's, w, sw',
      minHeight: 100,
      minWidth: 200,
      stop: function (e) {
        editor.resize();
        console.log("called editor.resize()");
      }
    });
}


module.exports = EditorUtils;