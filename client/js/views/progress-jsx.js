/**
 * Header progress bar
 * 
 * @jsx React.DOM
 */

var React = require('react');

var ProgressBar = React.createClass({

    render: function() {

        var barStyle = {
            width:  this.props.total ? ( this.props.done / this.props.total ) * 100 + '%' : '100%'
        }
          , todo = this.props.total - this.props.done
          , label = 'You have nothing to do... must be boring.';

        if(this.props.isSearching) {
            var results = this.props.isSearching.results;
            label = 'Your search for "'+ this.props.isSearching.term + '" yielded ' + results + ' result' +(results>1?'s':'');
        }
        else if(todo > 0)
            label = 'You have '+todo+' thing'+(todo>1?'s':'')+' to do.';

        return (
            <div className="noteProgress">
                <div className="noteProgressBg" />
                <div className="noteProgressBar" style={barStyle} />
                <div className="noteProgressLabel">{ label }</div>
            </div>
        );
    }

});

module.exports = ProgressBar;