import React from 'react';
import {
    VictoryChart,
    VictoryAxis,
    createContainer,
    VictoryZoomContainer,
    VictoryBar,
    Bar
} from 'victory';

const ZoomSelectionContainer = createContainer('zoom', 'selection');

const extractBins = props =>
    props.bins.map(bin => ({
        y: bin.count,
        x: new Date(bin.values[0]) // we use the START TIME of a bin as its time.,
    }));

const stopPropagation = e => {
    e.nativeEvent.stopImmediatePropagation();
    e.nativeEvent.stopPropagation();
    e.stopPropagation();
    e.preventDefault();
    return false;
};

export default class Timebar extends React.Component {
    constructor(props) {
        super(props);
        this.state = { allowPan: false };
    }

    getBinsAsArray() {
        if (Array.isArray(this.props.bins)) {
            return this.props.bins;
        } else {
            const retVal = [];
            for (var i = 0; i < this.props.bins.length; i++) {
                retVal.push(this.props.bins[i]);
            }

            return retVal;
        }
    }

    onSelection([x]) {
        if (this.props.setSelection) {
            const selection = x.eventKey;
            this.props.setSelection(selection);
        }
    }

    onSelectionCleared() {
        if (this.props.setSelection) {
            this.props.setSelection([]);
        }
    }

    onBarClick(index) {
        if (this.props.setSelection) {
            this.props.setSelection([index]);
        }
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
        const bins = this.getBinsAsArray();

        return (
            <div
                data-component-name="graphistry-timebar"
                onMouseDown={stopPropagation}
                onMouseMove={stopPropagation}
                onMouseOver={stopPropagation}
                onMouseUp={stopPropagation}
                onWheel={stopPropagation}
                onScroll={stopPropagation}>
                <VictoryChart
                    theme={this.props.theme}
                    width={this.props.width}
                    height={this.props.height}
                    scale={{ x: 'time' }}
                    domainPadding={{ x: [20, 10], y: 20 }}
                    containerComponent={
                        <ZoomSelectionContainer
                            allowPan={false}
                            zoomDimension="x"
                            zoomDomain={this.state.zoomDomain}
                            selectionDimension="x"
                            onSelection={this.onSelection.bind(this)}
                            onSelectionCleared={this.onSelectionCleared.bind(this)}
                        />
                    }>
                    <VictoryAxis dependentAxis offsetX={40} />
                    <VictoryAxis fixLabelOverlap />
                    <VictoryBar
                        data={this.getBinsAsArray()}
                        offsetY={1}
                        alignment="middle"
                        y="count"
                        x={datum => datum.values[0]}
                        labels={datum => datum.y}
                        style={{
                            data: { fill: (d, active) => (active ? 'darkslategrey' : 'lightgrey') }
                        }}
                        events={[
                            {
                                target: 'data',
                                eventHandlers: {
                                    onMouseOver: (_, __, dataIndex) => {
                                        this.onBarMouseOver(dataIndex);
                                        return [
                                            {
                                                mutation: props => ({ hovered: true })
                                            }
                                        ];
                                    },
                                    onMouseOut: (_, __, dataIndex) => {
                                        this.onBarMouseOut(dataIndex);
                                        return [
                                            {
                                                mutation: props => ({ hovered: false })
                                            }
                                        ];
                                    },
                                    onMouseDown: (_, __, dataIndex) => {
                                        this.onBarClick(dataIndex);
                                    }
                                }
                            }
                        ]}
                    />
                </VictoryChart>
                <div style={{ backgroundColor: '#494949' }}>
                    <button
                        style={{
                            paddingLeft: '10px',
                            paddingRight: '10px',
                            border: 'none',
                            borderRight: '1px solid black',
                            borderRadius: '0',
                            height: '20px',
                            color: 'DeepSkyBlue',
                            backgroundColor: '#323232'
                        }}
                        onClick={this.play.bind(this)}>
                        ►
                    </button>
                    <button
                        style={{
                            paddingLeft: '15px',
                            paddingRight: '15px',
                            border: 'none',
                            borderLeft: '1px solid black',
                            borderRadius: '0',
                            height: '20px',
                            color: 'white',
                            backgroundColor: '#323232',
                            float: 'right'
                        }}
                        onClick={this.togglePan.bind(this)}>
                        {this.state.allowPan ? 'Disable Panning' : 'Enable Panning'}
                    </button>
                </div>
            </div>
        );
    }
}
