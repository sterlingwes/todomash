var unirest = require('unirest')
  , creds = require('../twilio.json'); // don't commit our credentials to github with gitignore

module.exports = {

  hasNotifyTag: function(body) {
    var tag = body.match(/notify:[0-9\(\)\-\+\.\s]+/);
    if(tag && tag.length)
      tag = tag[0].replace(/notify:/,'').replace(/[\(\)\-\.\s]/,'');
    return tag;
  },

  send: function(to, msg) {

    if(!to || !msg) return; // should really do better phone number validation and notify the user of issues

    if(msg.length > 154) msg = msg.substr(0,150) + '...';

    unirest.post("https://twilio.p.mashape.com/"+ creds.sid +"/SMS/Messages.json")
    .headers({ 
      "X-Mashape-Authorization": creds.mash
    })
    .auth({
      "username": creds.sid,
      "password": creds.tkn
    })
    .send({ 
      "From": "(415) 419-8718",
      "To": to,
      "Body": msg
    })
    .end(function (response) {
      console.log(response);
    });
  }
};