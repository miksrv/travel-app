import React, { useState } from 'react'
import Markdown from 'react-markdown'

import { concatClassNames as cn, truncateText } from '@/functions/helpers'

import styles from './styles.module.sass'

interface ReadMoreProps {
    className?: string
    children?: string
    charCount?: number
}

const ReadMore: React.FC<ReadMoreProps> = ({
    className,
    children,
    charCount = 300
}) => {
    const [readMore, setReadMore] = useState(false)

    const toggleReadMore = () => {
        setReadMore(!readMore)
    }

    return (
        <div className={cn(className, styles.readMore)}>
            {!readMore ? (
                <p>{truncateText(children, charCount) + '...'}</p>
            ) : (
                <Markdown>{children}</Markdown>
            )}

            <button
                onClick={toggleReadMore}
                className={styles.readMoreButton}
            >
                {readMore ? 'Show more' : 'Show less'}
            </button>
        </div>
    )
}

export default ReadMore
