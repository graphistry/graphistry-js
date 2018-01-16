import React from 'react';

export default class Bar extends React.Component {
    constructor(props) {
        super(props);
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
                />
                <span className="barLabel">
                    {label}
                </span>
            </div>
        );
    }
}
