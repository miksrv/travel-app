import React from 'react'
import { cn, Icon } from 'simple-react-ui-kit'

import styles from './styles.module.sass'

export interface RadioButtonProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string
}

export const RadioButton: React.FC<RadioButtonProps> = ({ label, ...props }) => (
    <div className={cn(styles.radioButton, props.disabled && styles.disabled)}>
        <div className={cn(styles.formField, props.checked && styles.checked)}>
            {props.checked ? <Icon name={'RadioButtonChecked'} /> : <Icon name={'RadioButtonUnchecked'} />}
            <input
                {...props}
                type={'radio'}
            />
        </div>
        {label && <label htmlFor={props.id}>{label}</label>}
    </div>
)
