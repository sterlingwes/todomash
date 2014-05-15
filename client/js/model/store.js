/**
 * Our client side data store.
 * 
 * Provides an event-based dispatcher that relays data changes to the UI in 
 * as contemplated by Facebook's Flux client side architecture
 * 
 * see github.com/sterlingwes/flux
 */

var ajax = require('ajax').ajax
  , Flux = require('flux')
  , Dispatcher = Flux.AppDispatcher
  , EventEmitter = require('events').EventEmitter
  , extend = require('../misc/extend')
  , CHANGE_EVENT = 'change'
  , Actions = Flux.call
  , API_ENDPOINT = '/api/v1/items'
  , _todos = {}
  , initialFetch = false
;

// register the event types we'll be checking for

Flux.register([
    'get','create','update','markdone','markundone','delete','reconcile'
]);

var Store = extend(EventEmitter.prototype, {

    // fetch items from server if we haven't already, otherwise return the whole store
    
    getAll: function() {
        if(!initialFetch) {
            initialFetch = true;
            ajax({
                url:    API_ENDPOINT,
                complete: function(res) {
                    if(res && res.length)
                        Actions('get', {items:res});
                }
            });
        }
        return _todos;
    },

    // add one or more items (more if called by initial fetch, above)
    // if the item is new, store it by its timestamp until we can reconcile _id with server
    // send a RECONCILE event when complete to update the record with the corresponding _id
    
    add: function(todo) {

        if(todo.length) {
            todo.forEach(function(t) {
                _todos[t._id] = t;
            });
            return;
        }

        var newTodo = {
            _id:   todo._id,
            done: false,
            saving: true,
            title: todo.title,
            time: todo.time
        };

        _todos[newTodo._id || newTodo.time+''] = newTodo;

        ajax({
            url:    API_ENDPOINT,
            data:   newTodo,
            type:   'POST',
            complete: function(res) {
                Actions('reconcile', res);
            }
        });
    },
    
    // update an item and emit a RECONCILE event to sync on response
    // the saving field indicates that no further changes can be made to the item until it is reconciled
    
    update: function(todo) {
        if(!todo._id)
            return;

        extend(_todos[todo._id], todo);
        _todos[todo._id].saving = true;

        ajax({
            url:  API_ENDPOINT,
            data: todo,
            type: 'PUT',
            complete: function(res) {
                Actions('reconcile', res);
            }
        });
    },
    
    // call to delete a single item, assume it completes successfully and remove beforehand

    remove: function(id) {
        delete _todos[id];
        ajax({
            url:  API_ENDPOINT + '/' + id,
            type: 'DELETE'
        });
    },
    
    // send data change events to our main view (todolist)

    emitChange: function() {
        this.emit(CHANGE_EVENT);
    },

    addChangeListener: function(callback) {
        this.on(CHANGE_EVENT, callback);
    },

    removeChangeListener: function(callback) {
        this.removeListener(CHANGE_EVENT, callback);
    }
});

Dispatcher.register(function(payload) {
    var action = payload.action;
    var title;

    switch(action.actionType) {

        case 'get':
            if(action.items && action.items.length)
                Store.add(action.items);
            break;

        case 'create':
            title = action.title.trim();
            if (title !== '') {
                Store.add(action);
            }
            break;

        case 'reconcile':
            if(_todos[action._id]) {
                extend(_todos[action._id], action);
            }
            else if(_todos[action.time+'']) {
                _todos[action._id] = extend({_id: action._id}, _todos[action.time+'']);
                delete _todos[action.time+''];
            }
            _todos[action._id].saving = false;
            break;

        case 'markundone':
            Store.update({_id: action.item._id, done: false});
            break;

        case 'markdone':
            Store.update({_id: action.item._id, done: true});
            break;

        case 'update':
            if(action.title)
                title = action.title.trim();
            console.log(action, title);
            if ((typeof title === 'string' && title !== '') || title === undefined) {
                Store.update(action);
            }
            break;

        case 'delete':
            Store.remove(action._id);
            break;

        default:
            return true; // don't emit change
    }
    Store.emitChange();

    return true;
});

module.exports = Store;