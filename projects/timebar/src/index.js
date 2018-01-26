import React from 'react';
import ReactDOM from 'react-dom';
import Header from './header';
import Footer from './footer';
import TimeControls from './timecontrols';
import SelectionArea from './selectionarea';
import Bar from './bar';
import moment from 'moment';

const X_AXIS_FREQUENCY = 1;

const stopPropagation = e => {
    e.stopPropagation();
    e.preventDefault();
    return false;
};

const computeOffset = el => {
    var rect = el.getBoundingClientRect(),
        scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
        scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    return {
        x: rect.left + scrollLeft,
        y: rect.top + scrollTop,
        width: rect.width,
        height: rect.height
    };
};

export default class Timebar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selection: [],
            highlight: null,
            selectionDetails: { active: false },
            dragging: false,
            bins: this.normalizeBins(props.bins),
            bounds: { x: 0, y: 0 }
        };
    }

    onChartScroll(e) {
        e.stopPropagation();
        e.preventDefault();
        if (this.props.onZoom) {
            this.props.onZoom(e);
        }
    }

    componentWillReceiveProps(props) {
        const bins = this.normalizeBins(props.bins);
        this.setState({ bins });
    }

    /*
        "count": 0,
        "exclude": false,
        "values": {
        "$type": "atom",
        "value": [1501311600000, 0.944795076636391, 1]
        }
    */
    normalizeBins(bins) {
        const length = bins.length;
        const maxCount = Math.max.apply(null, bins.map(bin => bin.count));

        const normalize = ({ count, values }, index) => {
            const [timestamp, xOffset, widthMultiplier] = values.value;

            return {
                width: `${widthMultiplier}%`,
                height: `${100 * (count / maxCount)}%`,
                x: `${100 * xOffset}%`,
                label: count,
                color: 'red',
                timestamp: moment(timestamp),
                _x_offset: xOffset,
                _width: widthMultiplier
            };
        };
        return bins.map(normalize);
    }

    setSelection(selection = []) {
        this.setState({ selection });
        if (this.props.onSelect) {
            this.props.onSelect(selection);
        }
    }

    clearSelection() {
        this.setState({
            dragging: false,
            selectionDetails: {
                active: false,
                from: null,
                to: null
            }
        });

        this.setSelection([]);
    }

    onBarClick(index) {
        if (this.props.onSelection) {
            this.props.onSelection([index]);
        }
    }

    onBarMouseOver(index) {
        this.setState({ highlight: index });
        if (this.props.onHighlight) {
            this.props.onHighlight(index);
        }
    }

    onBarMouseOut(index) {
        if (this.props.onHighlight) {
            this.props.onHighlight(null);
        }
    }

    startDragSelection(e) {
        const bounds = computeOffset(e.currentTarget);

        this.setState({
            dragging: true,
            selectionDetails: {
                active: true,
                from: e.clientX,
                to: e.clientX
            },
            bounds
        });
    }

    onMouseMove(e) {
        if (!this.state.dragging) {
            return;
        }

        const selectionDetails = {
            to: e.clientX,
            from: this.state.selectionDetails.from,
            active: this.state.selectionDetails.active
        };

        const selection = this.computeSelectionFromDragBounds(
            selectionDetails.from,
            selectionDetails.to
        );

        this.setSelection(selection);

        this.setState({
            selectionDetails
        });
    }

    computeSelectionFromDragBounds(from, to) {
        const { start, stop } = this.getNormalizedDragBounds(from, to);

        return this.state.bins.reduce((acc, val, index) => {
            if (val._x_offset >= start && val._x_offset <= stop) {
                acc.push(index);
            }

            return acc;
        }, []);
    }

    getNormalizedDragBounds(from, to) {
        return {
            start: (Math.min(from, to) - this.state.bounds.x) / this.state.bounds.width,
            stop: (Math.max(from, to) - this.state.bounds.x) / this.state.bounds.width
        };
    }

    stopDragSelection(e) {
        this.setState({ dragging: false });
    }

    render() {
        const { bins } = this.state;
        if (!bins) {
            return <div />;
        }

        return (
            <div
                className="timebarWrapper"
                data-component-name="graphistry-timebar-src"
                onMouseDown={stopPropagation}
                onMouseMove={stopPropagation}
                onMouseOver={stopPropagation}
                onMouseUp={stopPropagation}
                onScroll={stopPropagation}>
                <Header clearSelection={this.clearSelection.bind(this)} />
                <div
                    className="chart"
                    onMouseDown={this.startDragSelection.bind(this)}
                    onMouseUp={this.stopDragSelection.bind(this)}
                    onMouseMove={this.onMouseMove.bind(this)}
                    onWheel={this.onChartScroll.bind(this)}>
                    <SelectionArea
                        details={this.state.selectionDetails}
                        offset={{ x: this.state.bounds.x }}
                    />

                    {bins.map((item, index) =>
                        <Bar
                            key={item.x}
                            height={item.height}
                            x={item.x}
                            color={item.color}
                            label={item.label}
                            timestamp={item.timestamp}
                            showAxisLabel={index % X_AXIS_FREQUENCY === 0}
                            index={index}
                            onBarMouseOver={() => this.onBarMouseOver(index)}
                            onBarMouseOut={() => this.onBarMouseOut()}
                            onBarClick={() => this.setSelection([index])}
                        />
                    )}
                </div>
                <TimeControls from={bins[0].timestamp} to={bins[bins.length - 1].timestamp} />
                <Footer />
            </div>
        );
    }
}
