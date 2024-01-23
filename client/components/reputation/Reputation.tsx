import React from 'react'

import { concatClassNames as cn } from '@/functions/helpers'

import styles from './styles.module.sass'

interface ReputationProps {
    value: number
}

const Reputation: React.FC<ReputationProps> = ({ value }) => (
    <div
        className={cn(
            styles.reputation,
            value > 0 ? styles.green : value < 0 ? styles.red : undefined
        )}
    >
        {value}
    </div>
)

export default Reputation
