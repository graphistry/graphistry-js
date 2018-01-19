import React from 'react';

const Header = props =>
    <div className="timebarHeader">
        <button onClick={() => props.clearSelection()} className="clearSelectionButton">
            Clear Selection
        </button>
    </div>;

export default Header;
