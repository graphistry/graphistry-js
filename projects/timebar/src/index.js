import React from 'react';
import { VictoryChart, createContainer, VictoryZoomContainer, VictoryBar, Bar } from 'victory';

const ZoomSelectionContainer = createContainer('zoom', 'selection');

const extractBins = props =>
    props.bins.map(bin => ({
        y: bin.count,
        x: parseInt(bin.values[0]) // we use the START TIME of a bin as its time.,
    }));

export default class Timebar extends React.Component {
    constructor() {
        super();
        this.state = { allowPan: false };
    }

    getBinsInRange(from, to) {
        return this.props.bins.filter(bin => {
            const binStart = parseInt(bin.values[0]);
            return from <= binStart && binStart <= to;
        });
    }

    onSelection(_, { x: [from, to] }) {
        if (this.props.setSelection) {
            const selection = this.getBinsInRange(from, to);
            this.props.setSelection(selection);
        }
    }

    onSelectionCleared() {
        if (this.props.setSelection) {
            this.props.setSelection([]);
        }
    }

    onBarClick(index) {
        // not currently enabled
    }

    onBarMouseOver(index) {
        if (this.props.onHighlight) {
            this.props.onHighlight(this.props.bins[index]);
        }
    }

    onBarMouseOut(index) {
        if (this.props.onHighlight) {
            this.props.onHighlight(null);
        }
    }

    togglePan() {
        this.setState({ allowPan: !this.state.allowPan });
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
        const Container = this.state.allowPan
            ? <VictoryZoomContainer
                  allowPan={true}
                  zoomDimension="x"
                  zoomDomain={this.state.zoomDomain}
              />
            : <ZoomSelectionContainer
                  allowPan={false}
                  zoomDimension="x"
                  zoomDomain={this.state.zoomDomain}
                  selectionDimension="x"
                  onSelection={this.onSelection.bind(this)}
                  onSelectionCleared={this.onSelectionCleared.bind(this)}
              />;

        return (
            <div>
                <VictoryChart
                    width={this.props.width}
                    height={this.props.height}
                    scale={{ x: 'time' }}
                    domainPadding={{ x: 20 }}
                    containerComponent={Container}>
                    <VictoryBar
                        style={{ data: { stroke: 'red', fill: 'green' } }}
                        data={this.props.bins}
                        y="count"
                        x={datum => parseInt(datum.values[0])}
                        labels={datum => datum.y}
                        style={{ data: { fill: (d, active) => (active ? 'tomato' : 'gray') } }}
                        events={[
                            {
                                target: 'data',
                                eventHandlers: {
                                    onMouseOver: (_, __, dataIndex) => {
                                        this.onBarMouseOver(dataIndex);
                                        return [
                                            {
                                                mutation: props => ({ ...props, hovered: true })
                                            }
                                        ];
                                    },
                                    onMouseOut: (_, __, dataIndex) => {
                                        this.onBarMouseOut(dataIndex);
                                        return [
                                            {
                                                mutation: props => ({ ...props, hovered: false })
                                            }
                                        ];
                                    },
                                    onClick: (_, __, dataIndex) => {
                                        this.onBarClick(dataIndex);
                                    }
                                }
                            }
                        ]}
                    />
                </VictoryChart>
                <div>
                    <button onClick={this.play.bind(this)}>Play</button>
                    <button onClick={this.togglePan.bind(this)}>
                        {this.state.allowPan ? 'Disable Panning' : 'Enable Panning'}
                    </button>
                </div>
            </div>
        );
    }
}
