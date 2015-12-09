var React = require('../../../../node_modules/react');

var ActionButtonsComponent = React.createClass({
  getDefaultProps: function () {
    return {
      actionType: 'go',
      disabled: false,
      clickAction: null
    }
  },

  getButtonClassName: function () {
    var actionType = this.props.actionType,
        disabled = this.props.disabled,
        btnClassName = 'action-button btn';

    if (actionType === 'go') {
      btnClassName += ' btn-primary';
    } else if (actionType === 'stop') {
      btnClassName += ' btn-danger';
    } else {
      btnClassName += ' btn-default';
    }
    if (disabled) {
      btnClassName += ' disabled';
    }

    return btnClassName;
  },

  //TODO make action dynamic
  goAction: function () {
    var self = this;
      
    //TODO: add animation to reduce height to 0
    $('#popup-content').slideUp("slow", function () {
      console.log("slideUp complete!");
      self.props.clickAction({
        type: 'goAction'
      });
      window.close();
    });
    // console.log("setting height to 50");
    // $('body').css("height", "50px");
    
  },

  resetApp: function () {
    chrome.runtime.reload();
  },

  render: function () {
    //TODO: add reload button
    var actionType = this.props.actionType,
        disabled = this.props.disabled,
        clickAction = this.props.clickAction,
        btnClassName = this.getButtonClassName(),
        actionEle;

    if (actionType) {
      actionEle = (
        <button className={btnClassName} onClick={this.goAction}>{actionType}</button>
      );
    }

    return (
      <div className="action-buttons">
        {actionEle}
        <button className="action-button btn btn-default" onClick={this.resetApp}>reset</button>
      </div>
    )
  }
});

module.exports = ActionButtonsComponent;