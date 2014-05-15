/**
 * Todo List
 *
 * This is the primary view (root layout) of the UI hierarchy.
 *
 * It receives all data store changes via listeners attached
 * to our model when the virtual DOM is mounted. It also acts as
 * the primary state controller for view redraws.
 *
 * @jsx React.DOM
 */

var React = require('react')
  , Store = require('../model/store')
  , TodoItem = require('./todoitem-jsx')
  , TodoInput = require('./todoinput-jsx')
  , Actions = require('flux').call
  , extend = require('../misc/extend')
  , ProgressBar = require('./progress-jsx')

  , logo = require('../../img/logo.png')
;

function hasClass(node, clsName) {
    var result = false
    , classes = node.className.split(/\s+/);

    if(typeof clsName !== 'string' && clsName && clsName.length) {
        clsName.forEach(function(cls) {
            if(classes.indexOf(cls)!=-1)
                result = true;
        });
    }
    else
        result = classes.indexOf(clsName)!=-1;

    return !!result;
}

var TodoList = React.createClass({

    // populates our data store & initializes state of current todo selection to nada
    
    getInitialState: function() {
        return extend(this._getModel(), { expandedTodo: -1 });
    },

    // listener for "tap-out" from current todo selection (sets selection state to nada)
    
    componentDidMount: function() {
        document.getElementsByTagName('body')[0];
        document.addEventListener('click', function(event) {
            var target = event.target.tagName;
            if(target!='LI' && !hasClass(event.target, ['noteCollapsed','noteExpanded','note']) && target!='SPAN')
                this._closeAll();
        }.bind(this));
        Store.addChangeListener(this._onChange);
    },

    // remove the listener, this only matters if this view becomes a sub layout at some point that will be re-mounted
    
    componentWillUnmount: function() {
        Store.removeChangeListener(this._onChange);
    },

    _getModel: function() {
        return {
            allTodos: Store.getAll()
        };
    },
    
    // the handler for change events fired by our data store

    _onChange: function() {
        this.setState(this._getModel());
    },
    
    // called by the new todo input as the "super" function passed along as a prop

    _onSave: function(title) {
        Actions('create', {
            title:  title,
            time:   (new Date()).valueOf()
        });
    },
    
    // called when a collapsed todo is clicked

    _expandTodo: function(id) {
        if(id !== this.state.expandedTodo)
            this.setState({ expandedTodo: id });
    },

    // called as a user searches (on field change)
    
    _search: function(event) {
        if(event.target.value)
            this.setState({
                search: new RegExp(event.target.value.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"),'ig'),
                sTerm:  event.target.value
            });
        else if(this.state.search)
            this.setState({ search: null, sTerm: null });
    },

    // used within render() to filter out todos during search
    
    _inSearch: function(t) {
        if(!this.state.search) return true;
        return this.state.search.test(t.title) || this.state.search.test(t.body||'');
    },
    
    // convenience for resetting the selected (expanded) todo

    _closeAll: function() {
        this.setState({ expandedTodo: -1 });
    },

    render: function() {

        var total = Object.keys(this.state.allTodos).length
        , todos = this.state.allTodos
        , todoitems = []
        , doneCount = 0;

        if (total > 0) {
            for(var i in todos) {
                var t = todos[i];
                if(t.done)    doneCount++;

                if(this._inSearch(t))
                    todoitems.push(<TodoItem key={i} todo={t} isExpanded={this.state.expandedTodo===i} onClick={this._expandTodo} unFocus={this._closeAll} />);
            }
                                   
            todoitems.sort(function(a,b) {
                if(a.props.todo.done && !b.props.todo.done)   return 1;
                if(b.props.todo.done && !a.props.todo.done)   return -1;
                return b.props.todo.time - a.props.todo.time;
            });
        }

        return (
            <section id="main">
                <header id="header">
                    <img src={logo} id="logo" />
                    <h1>todo<strong>mash</strong></h1>
                    <div id="inputs">
                        <TodoInput id="addtodo" placeholder="What do you need to do?" onSave={this._onSave} />
                        <input id="search" placeholder="Search your to-dos..." onChange={this._search} />
                        <i className="icon-feather" />
                        <i className="icon-search" />
                    </div>
                    <ProgressBar total={total} done={doneCount} isSearching={ this.state.sTerm ? {term:this.state.sTerm,results:todoitems.length} : false} />
                </header>
                <ul id="list" className="noteList">{todoitems}</ul>
                <footer>
                    <strong>Hot Tip!</strong>
                    <p>Send an SMS to someone when you mark a to-do item as complete!</p>
                    <p>Simply type "notify:+1-111-111-1111" (without the quotes) in the body of the to-do, using the phone number you'd like to notify.</p>
                </footer>
            </section>
        );
    }

});

module.exports = TodoList;