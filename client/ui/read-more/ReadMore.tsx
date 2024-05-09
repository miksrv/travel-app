import React, { useState } from 'react'
import Markdown from 'react-markdown'

import { concatClassNames as cn, truncateText } from '@/functions/helpers'

import styles from './styles.module.sass'

interface ReadMoreProps {
    className?: string
    children?: string
    charCount?: number
    showMoreText?: string
    showLessText?: string
}

const ReadMore: React.FC<ReadMoreProps> = ({
    className,
    children,
    charCount = 300,
    showMoreText = 'Show more',
    showLessText = 'Show less'
}) => {
    const [readMore, setReadMore] = useState(false)

    const toggleReadMore = () => {
        setReadMore(!readMore)
    }

    const toggleButton = () => (
        <button
            onClick={toggleReadMore}
            className={styles.readMoreButton}
        >
            {readMore ? showLessText : showMoreText}
        </button>
    )

    return (
        <div className={cn(className, styles.readMore)}>
            {!readMore ? (
                <p>
                    {truncateText(children, charCount) + '...'} {toggleButton()}
                </p>
            ) : (
                <>
                    <Markdown>{children}</Markdown>
                    {toggleButton()}
                </>
            )}
        </div>
    )
}

export default ReadMore
