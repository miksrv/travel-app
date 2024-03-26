import React from 'react'

import Icon from '@/ui/icon'

import { concatClassNames as cn } from '@/functions/helpers'

import styles from './styles.module.sass'

interface RadioButtonProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string
}

const RadioButton: React.FC<RadioButtonProps> = ({ label, ...props }) => (
    <div className={styles.radioButton}>
        <div className={cn(styles.formField, props.checked && styles.checked)}>
            {props.checked ? (
                <Icon name={'RadioButtonChecked'} />
            ) : (
                <Icon name={'RadioButtonUnchecked'} />
            )}
            <input
                {...props}
                type={'radio'}
            />
        </div>
        {label && <label htmlFor={props.id}>{label}</label>}
    </div>
)

export default RadioButton
