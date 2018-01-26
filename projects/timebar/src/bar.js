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
        const { height, x, width, label, color, timestamp, showAxisLabel } = this.props;
        return (
            <div className="barWrapper" style={{ left: x }}>
                <div
                    className="bar"
                    style={{
                        height,
                        width,
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
                <span className="axisLabel" style={{ display: showAxisLabel ? 'block' : 'none' }}>
                    {timestamp.format('ddd Do MMM YYYY [at] HH[:]MM')}
                </span>
            </div>
        );
    }
}
