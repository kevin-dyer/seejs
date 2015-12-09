var React = require('../../../../node_modules/react');

var ScriptItemComponent = React.createClass({

  getDefaultProps: function () {
    return ({
      script: {},
      scriptIndex: 0,
      updateList: null,
      messageBackground: null
    });
  },

  getInitialState: function () {
    return ({
      hover: false
    });
  },

  handleMouseEnter: function () {
    this.setState({hover: true})
  },

  handleMouseLeave: function () {
    this.setState({hover: false});
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
        scriptIndex = this.props.scriptIndex,
        hover = this.state.hover,
        itemClassName = hover ? 'script-name active' : 'script-name',
        sizeLabel = this.getSizeLabel(),
        checkContainer,
        checkContainerClassName,
        badgeClassName = 'badge';

    if (script.checked || hover) {
      checkContainerClassName = sizeLabel ==='xl' ? 'script-check bg-danger':
                                sizeLabel ==='lg' ? 'script-check bg-warning':
                                'script-check bg-info';
      checkContainerClassName += (hover && !script.checked) ? ' hover' : '';
      
    } else {
      checkContainerClassName = 'script-check invisible';
    }

     if (!script.checked) {
      itemClassName += ' text-muted';
      badgeClassName += ' badge-unchecked';
    }

    return (
      <li 
        className="list-group-item script-file script-item" 
        onClick={this.updateScriptItem}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave} >

        <div className={checkContainerClassName}></div>
        <div className="script-name-container" >
          <div className={itemClassName}>
            {script.name}
          </div>
          <span className={badgeClassName}>{sizeLabel}</span>
        </div>
         
      </li>
    );
  }    
});

module.exports = ScriptItemComponent;