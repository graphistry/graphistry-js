import React from 'react';

const SelectionArea = ({ details }) => {
    const { active, from, to } = details;
    if (!active) {
        return <div style={{ display: 'none' }} />;
    }
    const startX = Math.min(from, to);
    const endX = Math.max(from, to);
    const width = endX - startX;

    return <div className="selectionArea" style={{ left: startX, width }} />;
};
export default SelectionArea;
