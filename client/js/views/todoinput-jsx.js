/**
 * Input field component for adding items
 * 
 * @jsx React.DOM
 */

var React = require('react');

var TodoInput = React.createClass({

    getInitialState: function() {
        return {
            value: this.props.value || ''
        };
    },

    render: function() {
        return (
            <input
                className={this.props.className}
                id={this.props.id}
                placeholder={this.props.placeholder}
                onChange={this._onChange}
                onKeyDown={this._onKeyDown}
                value={this.state.value}
                autoFocus={true}
            />
        );
    },
    
    // called by _keyDown if ENTER is pressed, sends the save request up to the parent view

    _save: function() {
        this.props.onSave(this.state.value);
        this.setState({
            value: ''
        });
    },
    
    // save the value to state when the field changes

    _onChange: function(event) {
        this.setState({
            value: event.target.value
        });
    },
    
    // check whether a submission was made (ENTER / RETURN)

    _onKeyDown: function(event) {
        if (event.keyCode === 13) {
            this._save();
        }
    }

});

module.exports = TodoInput;