import React from 'react'

import { concatClassNames as cn } from '@/functions/helpers'

import styles from './styles.module.sass'

interface InputProps extends React.InputHTMLAttributes<unknown> {
    label?: string
    error?: string
}

const Input: React.FC<InputProps> = ({ label, error, ...props }) => (
    <div className={cn(styles.input, error && styles.error)}>
        {label && <label className={styles.label}>{label}</label>}
        <span className={styles.formField}>
            <input
                {...props}
                className={styles.input}
            />
        </span>
    </div>
)

export default Input
