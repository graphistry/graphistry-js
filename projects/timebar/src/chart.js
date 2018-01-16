import React from 'react';
import Bar from './bar';
import SelectionArea from './selectionarea';

export default class Chart extends React.Component {
    constructor(props) {
        super(props);
    }

    normalizeBins() {
        const { ymin, ymax, xmin, xmax } = this.props.bins.reduce(
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
        return this.props.bins.map(normalize);
    }

    render() {
        if (!this.props.bins || this.props.bins.length === 0) {
            return <div className="barWrapper empty" />;
        }
        return (
            <div className="chart">
                <SelectionArea />
                {this.normalizeBins().map((item, index) =>
                    <Bar
                        key={item.x}
                        height={item.height}
                        x={item.x}
                        color={item.color}
                        label={item.label}
                        index={index}
                        onBarMouseOver={() => this.props.onBarMouseOver(index)}
                        onBarMouseOut={() => this.props.onBarMouseOut()}
                    />
                )}
            </div>
        );
    }
}
