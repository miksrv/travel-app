import { useTranslation } from 'next-i18next'
import React from 'react'
import Markdown from 'react-markdown'

import { Comments } from '@/api/types/Comments'

import UserAvatar from '@/components/user-avatar'

import { timeAgo } from '@/functions/helpers'
import { concatClassNames as cn } from '@/functions/helpers'

import styles from './styles.module.sass'

interface CommentListItemProps {
    comment: Comments
    isAnswer?: boolean
}

const CommentListItem: React.FC<CommentListItemProps> = ({
    comment,
    isAnswer
}) => {
    const { t } = useTranslation('common', {
        keyPrefix: 'components.placesList.placesListItem'
    })

    return (
        <div className={cn(styles.commentItem, isAnswer && styles.answer)}>
            <div className={styles.rating}></div>
            <div className={styles.content}>
                <UserAvatar
                    showName={true}
                    size={'medium'}
                    user={comment.author}
                    caption={timeAgo(comment?.created?.date)}
                />
                <div className={styles.text}>
                    <Markdown>{comment.content}</Markdown>
                </div>
            </div>
        </div>
    )
}

export default CommentListItem
