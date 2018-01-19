import React from 'react';
import moment from 'moment';

const TimeControls = ({ from, to }) => {
    const t1 = moment(from);
    const t2 = moment(to);

    const difference = moment(t2.diff(t1));

    return (
        <div className="timeControls">
            <span>
                Current Range starts at {t1.format('ddd Do MMM YYYY [at] HH[:]MM')} and continues
                for about {t1.from(t2, true)}.
            </span>
        </div>
    );
};

export default TimeControls;
