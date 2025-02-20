import React, { Suspense } from 'react';

export default function ExperimentLayout(
    { children, editform }:
        Readonly<{ children: React.ReactNode, editform: React.ReactNode }>) {
    return (
        <div className="experiment-layout">
            {children}
            {editform}
        </div>
    );
};
