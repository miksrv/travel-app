import Link from 'next/link'
import React from 'react'

import Icon from '@/ui/icon'
import { IconTypes } from '@/ui/icon/types'

import { concatClassNames as cn } from '@/functions/helpers'

import styles from './styles.module.sass'

interface ContainerProps extends React.ButtonHTMLAttributes<unknown> {
    className?: string
    link?: string
    title?: string
    size?: 's' | 'm' | 'l'
    mode?: 'primary' | 'secondary' | 'tertiary' | 'outline' | 'link'
    variant?: 'positive' | 'negative' | 'neutral'
    icon?: IconTypes
    children?: React.ReactNode
}

const Button: React.FC<ContainerProps> = ({
    className,
    link,
    title,
    size,
    mode,
    variant,
    icon,
    children,
    ...props
}) => {
    const button = (
        <button
            {...props}
            type={props.type || 'button'}
            className={cn(
                className,
                styles.button,
                mode && styles[mode],
                variant && styles[variant],
                size && styles[size],
                !children && styles.noText
            )}
        >
            {icon && <Icon name={icon} />}
            {children}
        </button>
    )

    return link ? (
        <Link
            href={link}
            title={''}
        >
            {button}
        </Link>
    ) : (
        button
    )
}

export default Button
