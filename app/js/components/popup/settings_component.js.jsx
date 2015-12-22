var React = require('../../../../node_modules/react'),
    CheckboxItemComponent = require('./checkbox_item_component.js.jsx');

var SettingsComponent = React.createClass({
  getDefaultProps: function () {
    return ({
      settings: {unminify: true},
      updateSetting: null
    });
  },

  toggleUnminifySetting: function (){
    var settings = this.props.settings;

    console.log("toggleUnminifySetting!!!");
    
    settings.unminify = !settings.unminify;

    this.props.updateSettings({settings: settings});
  },
  

  render: function () {
    return (
      <div className="settings script-list-container">
        <div className="settings-header">
          <h6 className="file-list-title">
            settings
          </h6>
        </div>

        <CheckboxItemComponent
          checked={this.props.settings.unminify}
          type='setting'
          content='Unminify source code'
          clickHandler={this.toggleUnminifySetting} />
      </div>
    )
  }
});

module.exports = SettingsComponent;