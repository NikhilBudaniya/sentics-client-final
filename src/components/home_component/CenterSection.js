import React from 'react';
import Heatmap from './Heatmap';
import TopNav from './TopNav';

function CenterSection() {
    return (
        <div className="">
            <div className="bg-yellow-200">
                <TopNav />
            </div>
            <div className="p-5">
                <Heatmap />
            </div>
        </div>
    )
}

export default CenterSection