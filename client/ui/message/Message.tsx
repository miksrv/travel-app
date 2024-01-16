import React from 'react'

import { concatClassNames as cn } from '@/functions/helpers'

import styles from './styles.module.sass'

interface MessageProps extends React.HTMLAttributes<HTMLDivElement> {
    title?: string
    list?: string[]
    text?: string
    type?: 'negative'
}

const Message: React.FC<MessageProps> = ({
    title,
    text,
    list,
    type,
    ...props
}) => (
    <section
        {...props}
        className={cn(styles.message, type && styles[type])}
    >
        {title && <p className={styles.title}>{title}</p>}
        {text && <p className={styles.content}>{text}</p>}
        {list && (
            <ul className={styles.list}>
                {list?.map((item) =>
                    item.length ? <li key={`item${item}`}>{item}</li> : ''
                )}
            </ul>
        )}
    </section>
)

export default Message
