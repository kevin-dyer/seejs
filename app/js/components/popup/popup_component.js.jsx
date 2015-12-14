var React = require('../../../../node_modules/react'),
    DynamicScriptsComponent = require('./dynamic_scripts_component.js.jsx'),
    SettingsComponent = require('./settings_component.js.jsx'),
    ActionButtonsComponent = require('./action_buttons_component.js.jsx'),
    //visualizeSourceCode = chrome.extension.getBackgroundPage().visualizeSourceCode;
    port = chrome.extension.connect({name: "Sample Communication"});

var PopupComponent = React.createClass({
  getInitialState: function () {
    return ({
      settings: {unminify: false},
      fileList: [],
      inlineScriptList: []
    });
  },

  messageBackground: function (msg, callback) {
    //test
    console.log("message to background: ", msg);
    port.postMessage(msg);
    //background response
    port.onMessage.addListener(function(msg) {
      console.log("message recieved"+ msg);
      if (typeof(callback) === 'function') {
        callback(msg);
      }
    });
  },

  updateSettings: function (settings) {
    console.log("udating settings!");
    this.setState({settings: settings});
  },
  

  render: function () {
    //TODO: add status component
    //TODO: add settings component
    return (
      <div className="popup-component-content">
        <div className="page-header">
          <h3>
            SeeJS <small>Code Visualize</small>
          </h3>
        </div>
        <DynamicScriptsComponent 
          messageBackground={this.messageBackground} />

        <SettingsComponent
          settings={this.state.settings}
          updateSettings={this.updateSettings} />

        <ActionButtonsComponent 
          settings={this.state.settings}
          clickAction={this.messageBackground} />

      </div>
    )
  }
});

module.exports = PopupComponent;