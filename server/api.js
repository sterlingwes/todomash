/*
 * Bootstraps our API endpoints
 * 
 * see endpoints.js for method->resource mapping
 */

var Mongo = require('mongodb')
  , Client = Mongo.MongoClient
  , Server = Mongo.Server
  , Promise = require('es6-promise').Promise
  
  , API_NAMESPACE = '/api/v1/'
;

module.exports = function(app) {
    
    var MongoCli = new Client(new Server("localhost", 27017), { native_parser: true });
    
    // open our database connection and pass along a reference to our Todo collection
    
    var promise = new Promise(function(res,rej) {
          MongoCli.open(function(err, mongo) {
              if(err)   return rej(err);
              
              var Items = mongo.db('mashtest').collection('items');
              res(Items);
          });
      });
    
    // build endpoints from map @ ./endpoints
    
    promise.then(function(Items) {
        
        var Endpoints = require('./endpoints')(Items);
        
        Object.keys(Endpoints).forEach(function(resource) {
            if(resource[0]=='_')    return;
            
            Object.keys(Endpoints[resource]).forEach(function(method) {
                app[method](API_NAMESPACE + resource, Endpoints[resource][method]);
            });
        });
        
        return Items;
    });
    
    return promise;
    
};