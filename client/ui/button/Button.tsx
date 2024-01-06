import React from 'react'

import Icon from '@/ui/icon'
import { IconTypes } from '@/ui/icon/types'

import { concatClassNames as cn } from '@/functions/helpers'

import styles from './styles.module.sass'

interface ContainerProps extends React.ButtonHTMLAttributes<unknown> {
    className?: string
    mode?: 'primary' | 'secondary' | 'tertiary' | 'outline' | 'link'
    variant?: 'positive' | 'negative' | 'neutral'
    icon?: IconTypes
    children?: React.ReactNode
}

const Button: React.FC<ContainerProps> = ({
    className,
    mode,
    variant,
    icon,
    children,
    ...props
}) => (
    <button
        {...props}
        type={props.type || 'button'}
        className={cn(
            className,
            styles.button,
            mode && styles[mode],
            variant && styles[variant]
        )}
    >
        {icon && <Icon name={icon} />}
        {children}
    </button>
)

export default Button
