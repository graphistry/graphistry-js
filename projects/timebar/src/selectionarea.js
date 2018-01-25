import React from 'react';

const SelectionArea = ({ details, offset }) => {
    const { active, from, to } = details;
    if (!active) {
        return <div style={{ display: 'none' }} />;
    }
    const startX = Math.min(from, to);
    const endX = Math.max(from, to);
    const width = endX - startX;
    const left = startX - offset.x;

    return <div className="selectionArea" style={{ left, width }} />;
};
export default SelectionArea;
