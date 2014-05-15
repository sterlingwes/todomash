/*
 * Main entry point for our client
 */

// load fonts via Google Fonts

WebFontConfig = {
    google: { families: [ 'Gloria+Hallelujah::latin', 'Raleway:600,500:latin' ] }
};
(function() {
    var wf = document.createElement('script');
    wf.src = ('https:' == document.location.protocol ? 'https' : 'http') +
      '://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
    wf.type = 'text/javascript';
    wf.async = 'true';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(wf, s);
})();

var React = require('react')
  , AppMain = require('./js/views/todolist-jsx');

// render our view to the DOM template (provided by index.jade)
// this is pre-rendered by the server, and "attached" at runtime in the client by React

React.renderComponent(AppMain(), document.getElementById('container'));