var React = require('../../../../node_modules/react');

var CheckboxItemComponent = React.createClass({

  getDefaultProps: function () {
    return ({
      checked: false,
      type: 'xsScript', //xsScript - xxlScript, setting 
      content: '',
      badgeContent: '',
      clickHandler: null
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

  getCheckContainerClassName: function () {
    var checkContainerClassName,
        checked = this.props.checked,
        type = this.props.type,
        hover = this.state.hover;

    if (checked || hover) {
      checkContainerClassName = type === 'xxlScript' ? 'script-check bg-extreme-danger' :
                                type === 'xlScript' ? 'script-check bg-danger' :
                                type === 'lgScript' ? 'script-check bg-warning' :
                                'script-check bg-info'; //Default for settins too
      checkContainerClassName += (hover && !checked) ? ' hover' : '';
      
    } else {
      checkContainerClassName = 'script-check invisible';
    }

    return checkContainerClassName;
  },

  getItemClassName: function () {
    var itemClassName = this.state.hover ? 'script-name active' : 'script-name';

    if (!this.props.checked) {
      itemClassName += ' text-muted';
    }

    return itemClassName;
  },

  getBadge: function () {
    if (this.props.badgeContent) {
      return (
        <span className={this.getBadgeClassName()}>{this.props.badgeContent}</span>
      )
    }
  },

  getBadgeClassName: function () {
    var badgeClassName = 'badge';

    if (!this.props.checked) {
      badgeClassName += ' badge-unchecked';
    }

    return badgeClassName;
  },

  render: function () {
    return (
      <li 
        className='list-group-item script-file script-item'
        onClick={this.props.clickHandler}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave} >

        <div className={this.getCheckContainerClassName()}></div>
        <div className="script-name-container" >
          <div className={this.getItemClassName()}>
            {this.props.content}
          </div>
          {this.getBadge()}
        </div>
      </li>
    );
  }    
});

module.exports = CheckboxItemComponent;