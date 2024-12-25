import React from 'react'
import { cn } from 'simple-react-ui-kit'

import styles from './styles.module.sass'

interface ReputationProps {
    value: number
}

// TODO: Move this component to the UI section
const Reputation: React.FC<ReputationProps> = ({ value }) => (
    <div className={cn(styles.reputation, value > 0 ? styles.green : value < 0 ? styles.red : undefined)}>{value}</div>
)

export default Reputation
