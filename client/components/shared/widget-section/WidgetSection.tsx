import React from 'react'
import { cn } from 'simple-react-ui-kit'

import Link from 'next/link'

import styles from './styles.module.sass'

interface WidgetSectionProps {
    title?: string
    actionHref?: string
    actionLabel?: string
    /** HTML `title` attribute for the action link, when it should differ from the visible label. */
    actionTitle?: string
    /** Marks the action link as `nofollow noindex`, e.g. for parameterized/near-duplicate listing URLs. */
    actionNoIndex?: boolean
    /** Renders the action as a link-styled button that calls this handler instead of navigating, e.g. to open a dialog. */
    onActionClick?: React.MouseEventHandler<HTMLButtonElement>
    /** Custom action node (e.g. a button) rendered instead of the actionHref/actionLabel link. */
    action?: React.ReactNode
    /** Extra content (filter chips, description) rendered on its own row below the title, next to the action link. */
    extra?: React.ReactNode
    className?: string
    children?: React.ReactNode
}

export const WidgetSection: React.FC<WidgetSectionProps> = ({
    title,
    actionHref,
    actionLabel,
    actionTitle,
    actionNoIndex,
    onActionClick,
    action,
    extra,
    className,
    children
}) => {
    const actionLink =
        action ??
        (actionHref && actionLabel ? (
            <Link
                href={actionHref}
                title={actionTitle ?? actionLabel}
                rel={actionNoIndex ? 'nofollow noindex' : undefined}
                className={styles.action}
            >
                {actionLabel}
            </Link>
        ) : onActionClick && actionLabel ? (
            <button
                type={'button'}
                title={actionTitle ?? actionLabel}
                className={styles.action}
                onClick={onActionClick}
            >
                {actionLabel}
            </button>
        ) : undefined)

    return (
        <section className={cn(styles.section, className)}>
            {extra ? (
                <>
                    {title && <h2 className={styles.title}>{title}</h2>}

                    <div className={styles.extraRow}>
                        <div className={styles.extra}>{extra}</div>
                        {actionLink}
                    </div>
                </>
            ) : (
                (title || actionLink) && (
                    <div className={styles.header}>
                        {title && <h2 className={styles.title}>{title}</h2>}
                        {actionLink}
                    </div>
                )
            )}

            {children}
        </section>
    )
}
