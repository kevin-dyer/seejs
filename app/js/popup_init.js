var React = require('../../node_modules/react');
var ReactDOM = require('../../node_modules/react-dom');
var PopupComponent = require('./components/popup/popup_component.js.jsx');

ReactDOM.render(
  <PopupComponent />, 
  //<p>Hey</p>,
  document.getElementById('popup-content')
);