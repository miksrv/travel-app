import React from 'react'

import styles from './styles.module.sass'

interface InputProps extends React.InputHTMLAttributes<unknown> {
    label?: string
}

const Input: React.FC<InputProps> = ({ label, ...props }) => (
    <div className={styles.input}>
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
