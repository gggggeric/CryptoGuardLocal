// Tabs.js
import React, { useState } from 'react';
import './Tabs.css';

const Tabs = ({ tabs }) => {
    const [activeTab, setActiveTab] = useState(tabs[0].label);

    const handleTabClick = (label) => {
        setActiveTab(label);
    };

    return (
        <div className="tabs-container">
            <div className="tabs">
                {tabs.map((tab) => (
                    <button
                        key={tab.label}
                        className={`tab ${activeTab === tab.label ? 'active' : ''}`}
                        onClick={() => handleTabClick(tab.label)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
            <div className="tab-content">
                {tabs.find((tab) => tab.label === activeTab).content}
            </div>
        </div>
    );
};

export default Tabs;
