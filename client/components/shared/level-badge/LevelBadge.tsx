import React from 'react'

import { levelColors } from '@/utils/levels'

import styles from './styles.module.sass'

interface LevelBadgeProps {
    level?: number
    size?: number
}

const BORDER_WIDTH = 1

export const LevelBadge: React.FC<LevelBadgeProps> = ({ level, size = 32 }) => {
    const { fill, border } = levelColors(level)
    const outerSize = size + BORDER_WIDTH * 2
    const outerHeight = Math.round(outerSize * 1.15)
    const innerHeight = Math.round(size * 1.15)

    return (
        <div
            className={styles.hexagon}
            style={{ width: outerSize, height: outerHeight, backgroundColor: border }}
        >
            <div
                className={styles.hexagonInner}
                style={{ width: size, height: innerHeight, backgroundColor: fill }}
            >
                <span className={styles.level}>{level ?? 1}</span>
            </div>
        </div>
    )
}
