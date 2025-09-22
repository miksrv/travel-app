import React from 'react'
import { cn } from 'simple-react-ui-kit'

import styles from './styles.module.sass'

interface CounterProps {
    value?: number
    className?: string
}

export const Counter: React.FC<CounterProps> = ({ value, className }) =>
    value ? <div className={cn(className, styles.counter)}>{value}</div> : null
