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
  , cx = require('react/lib/cx')
  , Store = require('../model/store')
  , TodoItem = require('./todoitem-jsx')
  , TodoInput = require('./todoinput-jsx')
  , Actions = require('flux').call
  , extend = require('../misc/extend')
  , ProgressBar = require('./progress-jsx')
  , moment = require('moment/min/moment.min')
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
    return extend(this._getModel(), {
      filter: false,
      adding: false
    });
  },

  // listener for "tap-out" from current todo selection (sets selection state to nada)

  componentDidMount: function() {
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

  _onSave: function(newItem) {
    Actions('create', {
      title:  newItem.title,
      body:   newItem.body || '',
      time:   (new Date()).valueOf()
    });
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

  // used within render() to filter out todos during search / timeframe paging

  _inSearch: function(t,time) {
    if(!this.state.search) return time ? moment(t.time) > time : true;
    return this.state.search.test(t.title) || this.state.search.test(t.body||'');
  },
  
  _iconClick: function(event) {
    switch(event.target.className) {
        case "icon-calendar":       return "pageToday";
        case "icon-calendar-week":  return "pageWeek";
        case "icon-drawer":         return "pageAll";
        case "icon-cog":            return "pageSettings";
        case "icon-plus green":     return "addNew";
    }
  },
  
  _onPageChange: function(event) {
    var page = event.target.tagName=="SPAN" ? event.target.parentNode.id : (event.target.id || this._iconClick(event));
    if(!page) return;
    
    if(page!=='addNew')
      this.setState({ filter: page });
    else
      this.setState({ adding: true });
  },

  render: function() {

    var total = Object.keys(this.state.allTodos).length
      , todos = this.state.allTodos
      , todoitems = []
      , timeCut
      , doneCount = 0;

    if(this.state.filter=='pageWeek')
      timeCut = moment().subtract('weeks',1);
    else if(this.state.filter=='pageToday')
      timeCut = moment().subtract('days',1);
    
    if (total > 0) {
      for(var i in todos) {
        var t = todos[i];
        if(t.done)    doneCount++;

        if(this._inSearch(t,timeCut))
          todoitems.push(<TodoItem key={i} todo={t} />);
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
        <input id="search" placeholder="Search for a task" onChange={this._search} />
        <i className="icon-search" />
      </header>
      <section id="body">
        <ul id="list" className="noteList">
          {todoitems}
          <li className="done">
            <div className="doneCheck">
              <i className="icon-cross"></i>
            </div>
            <div className="doneMsg">
              Woohoo! You are done. Enjoy the rest of your day!
            </div>
          </li>
        </ul>
      </section>
      <nav>
        <div id="logo"></div>
        <ul onClick={this._onPageChange}>
          <li id="pageToday" className={cx({tab:true, active:this.state.filter=='pageToday'})}>
            <i className="icon-calendar"></i> Today
          </li>
          <li id="pageWeek" className={cx({tab:true, active:this.state.filter=='pageWeek'})}>
            <i className="icon-calendar-week"></i> Week
          </li>
          <li id="pageAll" className={cx({tab:true, active:(!this.state.filter||this.state.filter=='pageAll')})}>
            <i className="icon-drawer"></i> All time
          </li>
          <li id="pageSettings" className={cx({tab:true, active:this.state.filter=='pageSettings'})}>
            <i className="icon-cog"></i> Settings
          </li>
          <li className="divider"></li>
          <li id="addNew" className="tab">
            <i className="icon-plus green"></i> Add new
            <div className={cx({modal:true, modalOpen:this.state.adding})}>
              <TodoItem key={i} todo={{title:'',body:''}} saveNew={this._onSave} />
            </div>
          </li>
        </ul>
      </nav>
    </section>
    );
  }

});

module.exports = TodoList;