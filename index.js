var express = require('express')
  , app = express()
  , jade = require('jade')
  , fs = require('fs')
  , React = require('react')
  , build = require('./server/clientbuild')
  , API = require('./server/api')
  
  , PORT = 8080
;

app.use(express.static(__dirname + '/public'));
app.use(require('body-parser')());

// pre-render client app on the server side
  
var clientApp = React.renderComponentToString( build.render( __dirname + '/client/js/views/todolist-jsx')() );

fs.writeFileSync('./public/index.html', jade.renderFile('./client/index.jade', {
    renderApp: clientApp
}));

// ... bundle assets

console.log('building client bundle');

build.bundle(__dirname, function(err, stats) {
    if(err) console.error(err.trace);
    else if(stats.hasErrors())
        console.log(stats.toString());
});

// ... and setup API

API(app).then(function(Items) {
    
    app.listen(PORT);
    console.log('listening on '+PORT);
    
}).catch(function(err) {
    console.error(err);
});