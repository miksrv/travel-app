import React from 'react'

import { IconTypes } from '@/ui/icon/types'

interface IconProps {
    name: IconTypes
}

const Icon: React.FC<IconProps> = ({ name }) => {
    let iconToRender

    switch (name) {
        case 'Map':
            iconToRender = (
                <path d='m20.5 3-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM10 5.47l4 1.4v11.66l-4-1.4V5.47zm-5 .99 3-1.01v11.7l-3 1.16V6.46zm14 11.08-3 1.01V6.86l3-1.16v11.84z'></path>
            )
            break
        case 'Menu':
            iconToRender = (
                <path d='M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z'></path>
            )
            break
        case 'Terrain':
            iconToRender = (
                <path d='m14 6-4.22 5.63 1.25 1.67L14 9.33 19 16h-8.46l-4.01-5.37L1 18h22L14 6zM5 16l1.52-2.03L8.04 16H5z'></path>
            )
            break
    }

    return <svg viewBox='0 0 24 24'>{iconToRender}</svg>
}

export default Icon
