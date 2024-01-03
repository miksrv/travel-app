import React from 'react'

import Header from '@/components/header'

const PageLayout: React.FC<any> = ({ children, ...props }) => {
    return (
        <>
            <Header />
            {children}
        </>
    )
}

export default PageLayout
