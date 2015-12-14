var React = require('../../../../node_modules/react');

var SettingsComponent = React.createClass({
  getdefaultProps: function () {
    return ({
      settings: {unminify: false},
      updateSetting: null
    });
  },

  toggleUnminifySetting: function (){
    var settings = this.props.settings;
    
    settings.unminify = !settings.unminify;

    this.props.updateSettings({settings: settings});
  },
  

  render: function () {
    return (
      <div className="settings">
        <div className="settings-header">
          <h6>
            settings
          </h6>
        </div>
        <div className='form'>
          <div className='form-input-group'>
            <input type='checkbox' onChange={this.toggleUnminifySetting} />
            <label >Unminify source code</label>
          </div>
        </div>
      </div>
    )
  }
});

module.exports = SettingsComponent;