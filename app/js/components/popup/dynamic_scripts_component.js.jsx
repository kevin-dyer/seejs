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
    var self = this;
    
    console.log("getting script tags");
    this.props.messageBackground({
      type: 'getScriptTags'
    });

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

  //TODO: replace with setListCheckState
  // setAllInlineScripts: function (checkState) {
  //   var inlineScriptList = this.state.inlineScriptList.map(function (script) {
  //     script.checked = checkState;
  //     return script;
  //   });

  //   this.setState({inlineScriptList: inlineScriptList});
  // },

  // setAllFileScripts: function (checkState) {
  //   var fileList = this.state.fileList.map(function (script) {
  //     script.checked = checkState;
  //     return script;
  //   });

  //   this.setState({fileList: fileList});
  // },

  setListCheckState: function (listType, checkState) {
    var self = this,
        list = this.state[listType].map(function (script) {
          script.checked = checkState;
          return script;
        });
    this.setState({listType: list}, function () {
      self.props.messageBackground({
        type: 'updateMultipleScripts',
        scriptList: this.state[listType]
      });
    });
  },

  allScriptsChecked: function (scriptList) {
    var i,
        scriptLength = scriptList.length;

    for (i = 0; i < scriptLength; i++) {
      if (!scriptList[i].checked) {
        return false;
      }
    }
    return true;
  },

  toggleListCheckState: function (listType) {
    var list = this.state[listType];

    if (this.allScriptsChecked(list)) {
      this.setListCheckState(listType, false);
    } else {
      this.setListCheckState(listType, true);
    }
  },

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
            <a className="pull-right size-title link" onClick={this.toggleListCheckState.bind(self, 'fileList')}>
              {self.allScriptsChecked(self.state.fileList) ? 'Unselect All' : 'Select All'}
            </a>
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

      //TODO: break out select all link into component
      inlineScriptListContainer = (
        <div className="inline-script-list-container">
          <h6 className="file-list-title">
            Inline Scripts
            <a className="pull-right size-title link" onClick={this.toggleListCheckState.bind(self, 'inlineScriptList')}>
              {self.allScriptsChecked(self.state.inlineScriptList) ? 'Unselect All' : 'Select All'}
            </a>
            <div className="clearfix"></div>
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