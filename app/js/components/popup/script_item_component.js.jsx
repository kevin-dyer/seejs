var React = require('../../../../node_modules/react'),
    CheckboxItemComponent = require('./checkbox_item_component.js.jsx');

var ScriptItemComponent = React.createClass({

  getDefaultProps: function () {
    return ({
      script: {},
      scriptIndex: 0,
      updateList: null,
      messageBackground: null
    });
  },

  getSizeLabel: function () {
    var label,
        stringLength = this.props.script.size

    if (stringLength < 100) {
      label = 'xs';
    } else if (stringLength < 1000) {
      label = 'sm';
    } else if (stringLength < 10000) {
      label = 'md';
    } else if (stringLength < 100000) {
      label = 'lg';
    } else if (stringLength < 1000000) {
      label = 'xl';
    } else {
      label = 'xxl';
    }
    return label;
  },

  //TODO: remove
  updateList: function () {
    this.props.updateList(this.props.scriptIndex);
  },

  updateScriptItem: function () {
    var self = this,
        script = this.props.script;

    
    this.props.updateList(this.props.scriptIndex, function () {
      self.props.messageBackground({
        type: 'updateSourceCode',
        uniqueKey: script.uniqueKey,
        checked: script.checked
      });
    });
  },

  render: function () {
    var script = this.props.script,
        sizeLabel = this.getSizeLabel();

    return (
      <CheckboxItemComponent
        checked={script.checked}
        type={sizeLabel + 'Script'}
        scriptType={script.type}
        content={script.name}
        codePreview={script.preview}
        badgeContent={sizeLabel}
        clickHandler={this.updateScriptItem} />
    );
  }    
});

module.exports = ScriptItemComponent;