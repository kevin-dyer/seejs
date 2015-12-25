var React = require('../../../../node_modules/react');

var CheckboxItemComponent = React.createClass({

  getDefaultProps: function () {
    return ({
      checked: false,
      type: 'xsScript', //xsScript - xxlScript, setting
      scriptType: 'file', //inlineScript || file || undefined
      content: '',
      badgeContent: '',
      clickHandler: null
    });
  },

  getInitialState: function () {
    return ({
      hover: false,
      itemRef: null,
      expandedHeight: null,
      collapsedHeight: null
    });
  },

  handleMouseEnter: function () {
    this.setState({hover: true});
    this.state.itemRef.css({
      'height': this.state.expandedHeight,
      'overflow': 'visible',
      'white-space': 'normal'
    });
  },

  handleMouseLeave: function () {
    this.setState({hover: false});
    this.state.itemRef.css({
      'height': this.state.collapsedHeight,
      'overflow': 'hidden',
      'white-space': 'nowrap'
    });
  },

  setHeight: function (item) {
    var itemRef = $(item),
        expandedHeight = itemRef.outerHeight(),
        collapsedHeight;

    itemRef.css({
      'opacity': 0,
      'overflow': 'hidden',
      'white-space': 'nowrap'
    });
    collapsedHeight = itemRef.outerHeight();
    itemRef.css({
      'height': collapsedHeight,
      'opacity': 1,
      'transition': 'height 1s'
    });
    this.setState({
      itemRef: itemRef,
      expandedHeight: expandedHeight,
      collapsedHeight: collapsedHeight
    });
  },

  getListItemClassName: function () {
    var name = 'list-group-item script-file script-item';

    if (this.props.type === 'setting') {
      name += ' setting-item';
    }

    return name;
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

  getScriptNameClassName: function () {
    var itemClassName = this.state.hover && this.props.type !== 'setting' ? 'script-name active' : 'script-name';

    if (!this.props.checked) {
      itemClassName += ' text-muted';
    }

    return itemClassName;
  },

  getContent: function () {
    // console.log("scriptType: ", this.props.scriptType, ", codePreview: ", this.props.codePreview, ", hover: ", this.state.hover);
    // if (this.props.codePreview && this.state.hover) {
    //   return this.props.codePreview;
    // } else {
    //   return this.props.content;
    // }

    return (
      <span>
        {this.props.content}
        {this.props.codePreview ? <br/> : null}
        {this.props.codePreview}
      </span>
    );
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
        className={this.getListItemClassName()}
        onClick={this.props.clickHandler}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave} >

        <div className={this.getCheckContainerClassName()}></div>
        <div className="script-name-container" >
          <div
            className={this.getScriptNameClassName()}
            ref={this.setHeight} >

            {this.getContent()}
          </div>
          {this.getBadge()}
        </div>
      </li>
    );
  }    
});

module.exports = CheckboxItemComponent;