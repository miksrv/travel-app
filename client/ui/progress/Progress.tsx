import React from 'react'

import { concatClassNames as cn } from '@/functions/helpers'

import styles from './styles.module.sass'

interface ProgressProps {
    value?: number
    className?: string
}

const Progress: React.FC<ProgressProps> = ({ value, className }) => (
    <div className={cn(styles.progress, className)}>
        <div
            className={styles.line}
            style={{ width: `${value}%` }}
        />
    </div>
)

export default Progress
