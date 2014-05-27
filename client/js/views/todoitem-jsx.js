/**
* Rendering for individual todo items
* 
* @jsx React.DOM
*/

var React = require('react')
  , Actions = require('flux').call
  , cx = require('react/lib/cx')
  , moment = require('moment/min/moment.min')
;

var TodoItem = React.createClass({

  // use the state to determine if a saveable change was made (null for both fields indicates no)

  getInitialState: function() {
    return {
      title:  null,
      body:   null
    };
  },

  render: function() {
    var todo = this.props.todo
      , status
      , body
      , inputs = [
          <input key="1" type="text"
            id={todo._id ? 'editTitle_'+todo._id : 'addNewTitle'}
            className="note noteTitle"
            placeholder="Enter a note title (required)"
            value={this.state.title || todo.title}
            onChange={this._onChange}
            autoFocus={true} />,
        
          <textarea key="2"
            className="note noteBody"
            placeholder="Enter more detail here..."
            value={this.state.body!==null ? this.state.body : this.state.body || todo.body}
            onChange={this._onChange} />,
        
          <div key="3" className={cx({
            'noteOptions':  true,
            'isDirty':      this.state.title || this.state.body })}>
            <div className="btn red" onClick={this._onDelete}>Delete</div>
            <div className="btn grey" onClick={this._onReset}>Discard</div>
            <div className="btn blue" onClick={this._onSave}>Save</div>
          </div>
      ]
      , time = moment(todo.time).fromNow()
    ;
    
    if(this.props.saveNew)
      return <div>{inputs}</div>;

    if(todo.saving)
      status = 'Saving...';

    var checkId = 'todocheck-'+todo._id;
    
    if(this.state.isEditing) {
      body = [
          <span key="0" className="note time">{ time }</span>,
      ];
      body.push.apply(body, inputs);
    }
    else {
      body = [
        <span key="0" className="note time">{ time }</span>,
        
        <div key="1" className="note noteTitle">{ this.state.title || todo.title }</div>,
        
        <div key="2" className="note noteBody">{ this.state.body || todo.body }</div>
      ];
    }

    return (
      <li key={todo._id} className="noteItem">
        <div className="todoBody" id={'todo-'+(todo._id||todo.time)}>{ body }</div>
        <div className="checkbox">
          <input type="checkbox" value="None" id={checkId} name={checkId} checked={todo.done} onChange={this._onToggleComplete} disabled={todo.saving} />
          <label htmlFor={checkId}></label>
        </div>
        <i className={cx({'icon-cog':true, 'hide':this.state.isEditing})} title="Edit / Delete Note" onClick={this._onEdit}></i>
        { status }
      </li>
    );
  },
    
  // invoked by clicking the gear icon for this note
  
  _onEdit: function(event) {
    if(!this.state.isEditing)
      this.setState({ isEditing: true });
  },

  // if a valid change was made in either title or body fields, update state to indicate it's saveable

  _onChange: function(event) {
    var todo = this.props.todo
      , target = event.target.tagName
      , val = event.target.value.trim()
      , stateChg = {};

    stateChg[ target=='TEXTAREA' ? 'body' : 'title' ] = event.target.value;
    this.setState(stateChg);
  },

  // if the checkbox is clicked while collapsed, toggle the 'done' state

  _onToggleComplete: function() {
    Actions(this.props.todo.done ? 'markundone' : 'markdone', { item: this.props.todo });
  },

  // save any changes via the save button exposed when state is set

  _onSave: function() {
    
    if(this.props.saveNew)
      return this.props.saveNew({
        title:  this.state.title,
        body:   this.state.body
      });
    
    var changes = {
      _id:     this.props.todo._id
    };
    if(typeof this.state.title==='string')    changes.title = this.state.title;
    if(typeof this.state.body==='string')     changes.body = this.state.body;
    Actions('update', changes);
    this._onReset();
  },

  _onDelete: function() {
    Actions('delete', { _id: this.props.todo._id });
  },

  _onReset: function() {
    this.setState({
      title: null, body: null, isEditing: false
    });
    
    if(this.props.saveNew)
      this.props.saveNew();
  }

});

module.exports = TodoItem;