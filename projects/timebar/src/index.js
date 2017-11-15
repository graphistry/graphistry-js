import React from 'react';
import { VictoryChart, createContainer, VictoryBar } from 'victory';

const ZoomSelectionContainer = createContainer('zoom', 'selection');

export default class Timebar extends React.Component {
    constructor() {
        super();
        this.state = {};
    }

    onSelection(_, { x: [from, to] }) {
        this.setState({ selection: { from, to } });
        if (this.props.selectionChanged) {
            this.props.selectionChanged(from, to);
        }
    }

    onSelectionCleared() {
        this.setState({ selection: null });
        if (this.props.selectionCleared) {
            this.props.selectionCleared();
        }
    }

    onZoomDomainChange(domain) {
        this.setState({ zoomDomain: domain });
        console.log(domain);
        if (this.props.zoomChanged) {
            this.props.zoomChanged(domain);
        }
    }

    render() {
        const bins = this.props.bins.map(bin => ({
            y: bin.count,
            x: parseInt(bin.values[0])
        }));

        return (
            <div>
                <VictoryChart
                    width={800}
                    height={150}
                    scale={{ x: 'time', y: this.props.yScale }}
                    containerComponent={
                        <ZoomSelectionContainer
                            allowPan={false}
                            zoomDimension="x"
                            zoomDomain={this.state.zoomDomain}
                            selectionDimension="x"
                            selectionStyle={{
                                fill: 'tomato',
                                fillOpacity: 0.3,
                                stroke: 'black',
                                strokeWidth: 1
                            }}
                            onSelection={this.onSelection.bind(this)}
                            onSelectionCleared={this.onSelectionCleared.bind(this)}
                        />
                    }>
                    <VictoryBar
                        style={{ data: { stroke: 'red', fill: 'green' } }}
                        data={bins}
                        style={{ data: { fill: (d, active) => (active ? 'tomato' : 'gray') } }}
                    />
                </VictoryChart>
            </div>
        );
    }
}
