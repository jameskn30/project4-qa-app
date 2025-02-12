import React from 'react';

import { Spinner } from '@/components/ui/spinner';

const Loading = () => {
    return (
        <div className="flex flex-col justify-center items-center h-screen gap-3">
            <Spinner />
            <p>Loading user data</p>
        </div>
    );
};

export default Loading;
