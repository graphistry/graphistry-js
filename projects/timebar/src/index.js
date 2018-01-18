import React from 'react';
import Dimensions from 'react-dimensions';
import Header from './header';
import Footer from './footer';
import TimeControls from './timecontrols';
import SelectionArea from './selectionarea';
import Bar from './bar';

const stopPropagation = e => {
    e.stopPropagation();
    e.preventDefault();
    return false;
};

class Timebar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selection: [],
            highlight: null,
            selectionDetails: { active: false },
            dragging: false,
            bins: this.normalizeBins(this.getBinsAsArray(props.bins))
        };
    }

    componentWillReceiveProps(props) {
        const bins = this.normalizeBins(this.getBinsAsArray(props.bins));
        this.setState({ bins });
    }

    normalizeBins(bins) {
        const { ymin, ymax, xmin, xmax } = bins.reduce(
            (acc, val) => {
                if (val.count < acc.ymin) {
                    acc.ymin = val.count;
                }

                if (val.count > acc.ymax) {
                    acc.ymax = val.count;
                }

                if (val.values[0] < acc.xmin) {
                    acc.xmin = val.values[0];
                }

                if (val.values[0] > acc.xmax) {
                    acc.xmax = val.values[0];
                }

                return acc;
            },
            {
                ymin: Number.MAX_VALUE,
                ymax: Number.MIN_VALUE,
                xmin: Number.MAX_VALUE,
                xmax: Number.MIN_VALUE
            }
        );

        const yrange = ymax - ymin;
        const xrange = xmax - xmin;

        const normalize = ({ count, values }) => {
            return {
                height: count / yrange,
                x: (values[0] - xmin) / xrange,
                label: count,
                color: 'red'
            };
        };
        return bins.map(normalize);
    }

    getBinsAsArray(bins) {
        if (Array.isArray(bins)) {
            return bins;
        } else {
            const retVal = [];
            for (var i = 0; i < bins.length; i++) {
                retVal.push(bins[i]);
            }

            return retVal;
        }
    }

    setSelection(selection = []) {
        this.setState({ selection });
        if (this.props.setSelection) {
            this.props.setSelection(selection);
        }
    }

    clearSelection() {
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
        this.setState({ highlight: index });
        if (this.props.highlight) {
            this.props.highlight(index);
        }
    }

    onBarMouseOut(index) {
        if (this.props.highlight) {
            this.props.highlight(null);
        }
    }

    startDragSelection(e) {
        this.setState({
            dragging: true,
            selectionDetails: {
                active: true,
                from: e.clientX,
                to: e.clientX
            }
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
        console.log('Percent Bounds:', start, stop);
        return this.state.bins.reduce((acc, val, index) => {
            if (val.x >= start && val.x <= stop) {
                acc.push(index);
            }
            return acc;
        }, []);
    }

    getNormalizedDragBounds(from, to) {
        return {
            start: Math.min(from, to) / this.props.containerWidth,
            stop: Math.max(from, to) / this.props.containerWidth
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
                onWheel={stopPropagation}
                onScroll={stopPropagation}>
                <Header />
                <div
                    className="chart"
                    onMouseDown={this.startDragSelection.bind(this)}
                    onMouseUp={this.stopDragSelection.bind(this)}
                    onMouseMove={this.onMouseMove.bind(this)}>
                    <SelectionArea details={this.state.selectionDetails} />
                    {bins.map((item, index) =>
                        <Bar
                            key={item.x}
                            height={item.height}
                            x={item.x}
                            color={item.color}
                            label={item.label}
                            index={index}
                            onBarMouseOver={() => this.onBarMouseOver(index)}
                            onBarMouseOut={() => this.onBarMouseOut()}
                            onBarClick={() => this.setSelection([index])}
                        />
                    )}
                </div>
                <TimeControls />
                <Footer />
            </div>
        );
    }
}

export default Dimensions()(Timebar);
