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
        if (this.props.setSelection) {
            const selection = []; // TODO this should individually select each bar within the range
            this.props.setSelection(selection);
        }
    }

    onSelectionCleared() {
        this.setState({ selection: null });
        if (this.props.selectionCleared) {
            this.props.selectionCleared();
        }
    }

    onBarClicked() {
        // TODO allow toggle of individual bars - add/remove bar from selection.
    }

    onBarHover() {
        // TODO expose 'onBarHover' - consuming app should choose what to do with that knowledge.
    }

    play() {
        // TODO - this should setState( { selection: { from, to }}) on an interval, where `from`
        // is always 0 and `to` advanced one step per interval until the whole bar is selected.
        // then it should stop and garbage collect itself.
    }

    // this should be used with buttons that control zoom/position,
    // not added to UI yet
    onZoomDomainChange(domain) {
        this.setState({ zoomDomain: domain });
        if (this.props.zoomChanged) {
            this.props.zoomChanged(domain);
        }
    }

    render() {
        const bins = this.props.bins.map(bin => ({
            y: bin.count,
            x: parseInt(bin.values[0]) // we use the START TIME of a bin as its time.
        }));

        return (
            <div>
                <VictoryChart
                    width={800}
                    height={150}
                    scale={{ x: 'time' }}
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
