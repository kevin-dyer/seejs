(function () {
var editor = ace.edit("editor");
      editor.setTheme("ace/theme/chrome");
      editor.getSession().setMode("ace/mode/javascript");
      editor.setWrapBehavioursEnabled(true);
      editor.$blockScrolling = Infinity;
})();