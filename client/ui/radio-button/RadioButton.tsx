import React from 'react'

import Icon from '@/ui/icon'

import { concatClassNames as cn } from '@/functions/helpers'

import styles from './styles.module.sass'

interface RadioButtonProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: string
}

const RadioButton: React.FC<RadioButtonProps> = ({
    label,
    error,
    ...props
}) => (
    <div className={cn(styles.radioButton, error && styles.error)}>
        <div className={cn(styles.formField, props.checked && styles.checked)}>
            {props.checked ? (
                <Icon name={'RadioButtonChecked'} />
            ) : (
                <Icon name={'RadioButtonUnchecked'} />
            )}
            <input
                {...props}
                type={'radio'}
                className={styles.radio}
            />
        </div>
        {label && (
            <label
                className={styles.label}
                htmlFor={props.id}
            >
                {label}
            </label>
        )}
    </div>
)

export default RadioButton
