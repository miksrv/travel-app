import React from 'react'

import { concatClassNames as cn } from '@/functions/helpers'

import styles from './styles.module.sass'

interface CounterProps {
    value?: number
    className?: string
}

const Counter: React.FC<CounterProps> = ({ value, className }) =>
    value ? <div className={cn(className, styles.counter)}>{value}</div> : <></>

export default Counter
