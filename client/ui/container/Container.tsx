import React from 'react'

import { concatClassNames as cn } from '@/functions/helpers'

import styles from './styles.module.sass'

interface ContainerProps {
    title?: string
    className?: string
    action?: React.ReactNode
    header?: React.ReactNode
    children?: React.ReactNode
}

const Container: React.FC<ContainerProps> = ({
    className,
    title,
    action,
    header,
    children,
    ...props
}) => (
    <section
        {...props}
        className={cn(className, styles.container)}
    >
        {(header || title || action) && (
            <div className={styles.header}>
                {title && <h2 className={styles.title}>{title}</h2>}
                {header}
                {action}
            </div>
        )}
        {children}
    </section>
)

export default Container
