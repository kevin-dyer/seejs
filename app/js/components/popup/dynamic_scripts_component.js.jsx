var React = require('../../../../node_modules/react'),
    ScriptItemComponent = require('./script_item_component.js.jsx');

var DynamicScriptsComponent = React.createClass({

  getDefaultProps: function () {
    return ({
      messageBackground: null
    });
  },

  getInitialState: function () {
    return ({
      fileList: [], // {name: '', }
      inlineScriptList: [],
      fileHover: [],
      inlineHover: []
    });
  },

  componentWillMount: function () {
    var self = this,
        background = chrome.extension.getBackgroundPage();

    // BIG TODO: call background to get the scripts,
    // the background script should decide if it already has the scripts for that page. 
    // And if so, just return them again.
    // If the current page is a chrome extension, just show the existing script lists from the background
    console.log("getting script tags");

    background.getScriptTags();

    chrome.runtime.onMessage.addListener(
      function(request, sender, sendResponse) {

        if (request.type === 'scriptList') {
          var scriptList = request.scriptList,
              listLength = scriptList.length,
              sourceItem,
              i,
              fileList = [],
              inlineScriptList = [];

          for (i = 0; i < listLength; i++) {
            sourceItem = scriptList[i];
            if (sourceItem.type === 'file') {
              fileList.push(sourceItem);
            } else if (sourceItem.type === 'inlineScript') {
              inlineScriptList.push(sourceItem);
            }
          }
          self.setState({
            fileList: fileList,
            inlineScriptList: inlineScriptList
          });
        }
      } 
    );
  },

  updateFileList: function (index, callback) {
    var fileList = this.state.fileList;

    console.log("updateFileList: index: ", index);

    fileList[index].checked = !fileList[index].checked;

    this.setState({
      fileList: fileList
    }, callback);
  },

  updateInlineScriptList: function (index, callback) {
    var inlineScriptList = this.state.inlineScriptList;

    inlineScriptList[index].checked = !inlineScriptList[index].checked;

    this.setState({
      inlineScriptList: inlineScriptList
    }, callback);
  },

  handleMouseEnter: function (index, type) {
    var hoverList = type === 'inline' ? this.state.inlineHover : this.state.fileHover;

    hoverList[index] = true;

    if (type === 'inline') {
      this.setState({inlineHover: hoverList});
    } else {
      this.setState({fileHover: hoverList});
    }
    
  },

  handleMouseLeave: function (index) {
    var fileHover = this.state.fileHover;
    fileHover[index] = false;

    this.setState({fileHover: fileHover});
  },

  // getSizeLabel: function (stringLength) {
  //   var label;

  //   if (stringLength < 100) {
  //     label = 'xs';
  //   } else if (stringLength < 1000) {
  //     label = 'sm';
  //   } else if (stringLength < 10000) {
  //     label = 'md';
  //   } else if (stringLength < 100000) {
  //     label = 'lg';
  //   } else if (stringLength < 1000000) {
  //     label = 'xl';
  //   }
  //   return label;
  //   //return stringLength;
  // },

  render: function () {
    var self = this,
        fileList = this.state.fileList,
        inlineScriptList = this.state.inlineScriptList,
        messageBackground = this.props.messageBackground,
        fileListContainer,
        inlineScriptListContainer,
        loaderGif;

    if (!fileList.length && !inlineScriptList.length) {
      loaderGif = (
        <img className="file-loader-gif" 
             src="images/spinner-loader.gif" />
      )
    }

    //TODO: show elipsis if filename is too long, show exanded filename on hover
    if (fileList.length) {
      fileList = fileList.map(function (file, index) {

        return (
          <ScriptItemComponent
            key={index}
            scriptIndex={index}
            script={file}
            updateList={self.updateFileList}
            messageBackground={messageBackground} />
        );
      });

      fileListContainer = (
        <div className="file-list-container">
          <h6 className="file-list-title">
            Source Files
            <span className="pull-right size-title">size</span>
            <div className="clearfix"></div>
          </h6>
          <ul className="file-list list-group">
            {fileList}
          </ul>
        </div>
      );
    }

    //TODO: show beginning of script contents on hover
    //TODO: add click behavior to change makeBubbleChart
    if (inlineScriptList.length) {
      inlineScriptList = inlineScriptList.map(function (script, index) {

        return (
          <ScriptItemComponent
            key={index}
            scriptIndex={index}
            script={script}
            updateList={self.updateInlineScriptList}
            messageBackground={messageBackground} />
        );
      });

      inlineScriptListContainer = (
        <div className="inline-script-list-container">
          <h6 className="file-list-title">
            Inline Scripts
          </h6>
          <ul className="inline-script-list list-group">
            {inlineScriptList}
          </ul>
        </div>
      );
    }

    return (
      <div className="script-list-container">
        {loaderGif}
        {fileListContainer}
        {inlineScriptListContainer}
      </div>
    )
  }
});

module.exports = DynamicScriptsComponent;