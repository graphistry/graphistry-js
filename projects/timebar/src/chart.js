import React from 'react';



const noop = () => {};

export default class Chart extends React.Component {
    constructor(props) {
        super(props);
        this.state = { selectionDetails: { active: false }, dragging: false };
    }

    render() {
        if (!this.props.bins || this.props.bins.length === 0) {
            return <div className="barWrapper empty" />;
        }
        return (
            
        );
    }
}
