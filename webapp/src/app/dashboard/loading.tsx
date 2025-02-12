import React from 'react';

import { Spinner } from '@/components/ui/spinner';

const Loading = () => {
    return (
        <div className="flex justify-center items-center h-screen gap-3">
            <Spinner />
            <p>Loading authentication</p>
        </div>
    );
};

export default Loading;
