import React from 'react';

export default class Bar extends React.Component {
    constructor(props) {
        super(props);
    }

    cancelEvent(e) {
        e.stopPropagation();
        e.preventDefault();
        return false;
    }

    onHover(e) {
        if (this.props.onBarMouseOver) {
            this.props.onBarMouseOver();
        }

        this.cancelEvent(e);
    }

    onOut(e) {
        if (this.props.onBarMouseOut) {
            this.props.onBarMouseOut();
        }

        this.cancelEvent(e);
    }

    onClick(e) {
        if (this.props.onBarClick) {
            this.props.onBarClick();
        }

        this.cancelEvent(e);
    }

    render() {
        const { height, x, label, color } = this.props;
        return (
            <div className="barWrapper" style={{ left: `${x * 100}%` }}>
                <div
                    className="bar"
                    style={{
                        height: `${height * 100}%`,
                        bottom: 0,
                        position: 'absolute',
                        backgroundColor: color
                    }}
                    onMouseOver={this.onHover.bind(this)}
                    onMouseOut={this.onOut.bind(this)}
                    onClick={this.onClick.bind(this)}
                />
                <span className="barLabel">
                    {label}
                </span>
            </div>
        );
    }
}
