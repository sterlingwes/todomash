/*
 * Mapping of our API resources and applicable method handlers, mounted by ./api.js
 */

var ObjectID = require('mongodb').ObjectID
  , _ = require('underscore')
  , Twilio = require('./twilio')
  , keyWhitelist = ['_id', 'title', 'body', 'done', 'time']

  // convenience functions:

  , sendError = function(err) {
    return {
      error:    true,
      reason:   err.message || err.reason,
      trace:    err.trace
    };
  }

  , coerce = function(data) {
    data = _.pick(data || {}, keyWhitelist);
    if(data.title)    data.title = data.title.trim();
    return data;
  }

  , getId = function(idStr) {
    var id = false;
    try {
      id = ObjectID.createFromHexString(idStr);
    } catch(e) {}
    return id;
  }
;

// group endpoints by resource
// in production would certainly need better validation / sanitization

module.exports = function(Items) {

  return {

    'items': {

      get:    function(req,res) {
        Items.find().toArray(function(err,items) {
          if(err) res.json(500, sendError(err));
          res.json(200, items);
        });
      },

      post:   function(req,res) {
        var data = coerce(req.body);
        Items.insert(data, function(err,result) {
          if(err || !result.length) res.json(500, sendError(err));
          var newId = result[0]._id.toHexString();
          res.location("/api/v1/items/"+newId);
          res.send(303);
        });
      },

      // no patch for partial changes as we're essentially passing everything through mongo's $set

      put:    function(req,res) {
        var idStr = (req.body||{})._id
        , id = getId(idStr)
        , data = coerce(req.body);

        if(!id) return res.json(400, { reason: 'Provided item ID is invalid ('+ req.params._id +')' });  
        delete data._id;

        Items.update({_id: id}, {$set:data}, function(err) {
          if(err) res.json(500, sendError(err));
          res.location("/api/v1/items/"+idStr);
          res.send(303);

          // if item is marked complete, check for a notify: tag with phone number in the body

          if(Object.keys(data).length==1 && data.done === true)
            Items.findOne({_id: id}, function(err,rec) {
              if(rec && rec.body) {
                var phoneNo = Twilio.hasNotifyTag(rec.body);
                if(phoneNo) Twilio.send(phoneNo, 'Done: ' + rec.title);
              }
            });
        });
      }
    },

    'items/:id': {

      get:    function(req,res) {
        var id = getId(req.params.id);
        if(!id) return res.json(400, { reason: 'Provided item ID is invalid ('+ req.params.id +')' });
        Items.findOne({_id: id}, function(err,item) {
          if(err) res.json(500, sendError(err));
          res.json(200, item);
        });
      },

      // in production should be "sandboxed" by user session

      delete: function(req,res) {
        var id = getId(req.params.id);
        if(!id) return res.json(400, { reason: 'Provided item ID is invalid ('+ req.params.id +')' });
        Items.remove({_id: id}, function(err) {
          if(err) res.json(500, sendError(err));
          res.send(204);
        });
      }
    }

  };
};