import React from 'react'

import { concatClassNames as cn } from '@/functions/helpers'

import styles from './styles.module.sass'

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
    title?: string
    className?: string
    compact?: boolean
    action?: React.ReactNode
    header?: React.ReactNode
    children?: React.ReactNode
}

const Container: React.FC<ContainerProps> = ({
    className,
    compact,
    title,
    action,
    header,
    children,
    ...props
}) => (
    <section
        {...props}
        className={cn(className, styles.container, compact && styles.compact)}
    >
        {(header || title || action) && (
            <div className={styles.header}>
                {title && <h2 className={styles.title}>{title}</h2>}
                {header}
                {action && <div className={styles.actions}>{action}</div>}
            </div>
        )}
        {children}
    </section>
)

export default Container
