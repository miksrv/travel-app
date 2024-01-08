import React from 'react'

import { MapIconTypes } from './types'

interface IconProps {
    name: MapIconTypes
}

const MapIcon: React.FC<IconProps> = ({ name, ...props }) => {
    let iconToRender

    switch (name) {
        case 'Forest':
            iconToRender = (
                <>
                    <path d='M16 12 9 2 2 12h1.86L0 18h7v4h4v-4h7l-3.86-6z'></path>
                    <path d='M20.14 12H22L15 2l-2.39 3.41L17.92 13h-1.95l3.22 5H24zM13 19h4v3h-4z'></path>
                </>
            )
            break
        case 'Mount':
            iconToRender = (
                <path d='m14 6-3.75 5 2.85 3.8-1.6 1.2C9.81 13.75 7 10 7 10l-6 8h22L14 6z'></path>
            )
    }

    return (
        <svg
            {...props}
            viewBox={'0 0 24 24'}
        >
            <circle
                cx='12'
                cy='12'
                r='12'
                fill={'#50a200'}
            />
            <g
                transform={'scale(0.65) translate(6, 6)'}
                fill={'#FFF'}
            >
                {iconToRender}
            </g>
        </svg>
    )
}

export default MapIcon
