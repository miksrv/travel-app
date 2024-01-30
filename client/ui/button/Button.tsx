import Link from 'next/link'
import React from 'react'

import Icon from '@/ui/icon'
import { IconTypes } from '@/ui/icon/types'

import { concatClassNames as cn } from '@/functions/helpers'

import styles from './styles.module.sass'

interface ContainerProps extends React.ButtonHTMLAttributes<unknown> {
    className?: string
    link?: string
    stretched?: boolean
    size?: 's' | 'm' | 'l'
    mode?: 'primary' | 'secondary' | 'tertiary' | 'outline' | 'link'
    variant?: 'positive' | 'negative' | 'neutral'
    icon?: IconTypes
    children?: React.ReactNode
}

const Button: React.FC<ContainerProps> = ({
    className,
    link,
    stretched,
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
                stretched && styles.stretched,
                !children && styles.noText
            )}
        >
            {icon && <Icon name={icon} />}
            <div>{children}</div>
        </button>
    )

    return link ? (
        <Link
            className={styles.buttonLink}
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
