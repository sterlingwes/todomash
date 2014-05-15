/**
 * Rendering for individual todo items
 * 
 * @jsx React.DOM
 */

var React = require('react')
  , TodoInput = require('./todoinput-jsx')
  , Actions = require('flux').call
  , cx = require('react/lib/cx')
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
          , note = []
          , status
        ;

        if (this.props.isExpanded) {
            [].push.apply(note, [
                <input key="0" type="text"
                    className="note noteTitle"
                    value={this.state.title || todo.title}
                    onChange={this._onChange} />,
                
                <textarea key="1"
                    className="note"
                    placeholder="Enter more detail here..."
                    value={this.state.body || todo.body}
                    onChange={this._onChange} />,
                
                <div key="2" className={cx({
                    'noteOptions':  true,
                    'isDirty':      this.state.title || this.state.body })}>
                        <div className="btn blue" onClick={this._onSave}><i className="icon-checkmark"></i> Save</div>
                        <div className="btn red" onClick={this._onDelete}><i className="icon-trash"></i> Delete</div>
                        <div className="btn grey" onClick={this._onReset}>Cancel</div>
                </div>
            ]);
        }
        else {
            note.push(todo.title);
        }

        if(todo.saving)
            status = 'Saving...';

        var checkId = 'todocheck-'+todo._id;

        return (
            <li
                className={cx({
                'done':   todo.done,
                'isExpanded': this.props.isExpanded })}
                key={todo._id}>
                     <div className={cx({
                        'todoBody': true,
                        'noteExpanded': this.props.isExpanded,
                        'noteCollapsed':!this.props.isExpanded })}
                        id={'todo-'+(todo._id||todo.time)}
                        onClick={this._onClick}>
                            { note }
                    </div>
                    <div className="checkbox">
                        <input type="checkbox" value="None" id={checkId} name={checkId} checked={todo.done} onChange={this._onToggleComplete} disabled={todo.saving} />
                        <label htmlFor={checkId}></label>
                        </div>
                        { status }
                    </li>
        );
    },

    // if this item is clicked while collapsed, pass along the focus request to the main layout (up the hierarchy)
        
    _onClick: function(event) {
        var target = event.target;
        if(target.className.indexOf("noteCollapsed")!=-1 || target.tagName=="SPAN")
            this.props.onClick(this.props.todo._id);
    },
        
    // if a valid change was made in either title or body fields, update state to indicate it's saveable

    _onChange: function(event) {
        var todo = this.props.todo
        , target = event.target.tagName
        , val = event.target.value.trim()
        , stateChg = {};

        if(val)
            stateChg[ target=='TEXTAREA' ? 'body' : 'title' ] = event.target.value;

        this.setState(stateChg);
    },

    // if the checkbox is clicked while collapsed, toggle the 'done' state
        
    _onToggleComplete: function() {
        Actions(this.props.todo.done ? 'markundone' : 'markdone', { item: this.props.todo });
    },
        
    // save any changes via the save button exposed when state is set

    _onSave: function(title) {
        var changes = {
            _id:     this.props.todo._id
        };
        if(this.state.title)    changes.title = this.state.title;
        if(this.state.body)     changes.body = this.state.body;
        Actions('update', changes);
        this._onReset();
    },

    _onDelete: function() {
        Actions('delete', { _id: this.props.todo._id });
    },

    _onReset: function() {
        this.setState({
            title: null, body: null
        });
        this.props.unFocus();
    }

});

module.exports = TodoItem;