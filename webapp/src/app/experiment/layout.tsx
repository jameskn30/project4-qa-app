import React from 'react';

export default function ExperimentLayout(
    { children }:
        Readonly<{ children: React.ReactNode}>) {
    return (
        <div className="experiment-layout">
            {children}
        </div>
    );
};
