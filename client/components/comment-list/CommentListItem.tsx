import { useTranslation } from 'next-i18next'
import Link from 'next/link'
import React from 'react'
import Markdown from 'react-markdown'

import Button from '@/ui/button'

import { Comments } from '@/api/types/Comments'

import UserAvatar from '@/components/user-avatar'

import { timeAgo } from '@/functions/helpers'
import { concatClassNames as cn } from '@/functions/helpers'

import CommentForm from './CommentForm'
import styles from './styles.module.sass'

interface CommentListItemProps {
    comment: Comments
    isAuth?: boolean
    isAnswer?: boolean
    formAnswerId?: string
    onAnswerClick?: (id?: string) => void
}

const CommentListItem: React.FC<CommentListItemProps> = ({
    comment,
    isAuth,
    isAnswer,
    formAnswerId,
    onAnswerClick
}) => {
    const { t } = useTranslation('common', {
        keyPrefix: 'components.placesList.placesListItem'
    })

    return (
        <div className={cn(styles.commentItem, isAnswer && styles.answer)}>
            <div className={styles.block}>
                <UserAvatar
                    size={'medium'}
                    user={comment.author}
                />
                <div className={styles.content}>
                    <div className={styles.user}>
                        <Link
                            href={`/users/${comment.author.id}`}
                            title={''}
                        >
                            {comment.author.name}
                        </Link>
                    </div>
                    <Markdown>{comment.content}</Markdown>
                    <div className={styles.info}>
                        {timeAgo(comment?.created?.date)}

                        {isAuth && (
                            <Button
                                className={styles.answerButton}
                                onClick={() => onAnswerClick?.(comment.id)}
                                size={'s'}
                                mode={'link'}
                            >
                                {'ответить'}
                            </Button>
                        )}
                    </div>

                    {formAnswerId === comment.id && (
                        <CommentForm isAuth={isAuth} />
                    )}
                </div>
            </div>
        </div>
    )
}

export default CommentListItem
