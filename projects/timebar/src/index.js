import React from 'react';
import Chart from './chart';
import Header from './header';
import Footer from './footer';
import TimeControls from './timecontrols';

const stopPropagation = e => {
    e.stopPropagation();
    e.preventDefault();
    return false;
};

export default class Timebar extends React.Component {
    constructor(props) {
        super(props);
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
            console.log('onSelectionCleared fired');
            const selection = x.eventKey;
            this.props.setSelection(selection);
        }
    }

    onSelectionCleared() {
        if (this.props.setSelection) {
            console.log('onSelectionCleared fired');
            this.props.setSelection([]);
        }
    }

    onBarClick(index) {
        if (this.props.setSelection) {
            // this.props.setSelection([index]);
        }
    }

    onBarMouseOver(index) {
        if (this.props.onHighlight) {
            this.props.onHighlight(index);
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

    play() {}

    // this should be used with buttons that control zoom/position,
    // not added to UI yet
    onZoomDomainChange(domain) {
        this.setState({ zoomDomain: domain });
        if (this.props.zoomChanged) {
            this.props.zoomChanged(domain.x);
        }
    }

    render() {
        const bins = this.getBinsAsArray();

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
                <Chart
                    onBarMouseOver={this.onBarMouseOver.bind(this)}
                    onBarMouseOut={this.onBarMouseOut.bind(this)}
                    bins={bins}
                />
                <TimeControls />
                <Footer />
            </div>
        );
    }
}
