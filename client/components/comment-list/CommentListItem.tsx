import { useTranslation } from 'next-i18next'
import Link from 'next/link'
import React from 'react'
import Markdown from 'react-markdown'

import Button from '@/ui/button'

import { Comments } from '@/api/types/Comments'

import UserAvatar from '@/components/user-avatar'

import { concatClassNames as cn, timeAgo } from '@/functions/helpers'

import CommentForm from './CommentForm'
import styles from './styles.module.sass'

interface CommentListItemProps {
    placeId: string
    comment: Comments
    isAuth?: boolean
    isAnswer?: boolean
    formAnswerId?: string
    onAnswerClick?: (id?: string) => void
}

const CommentListItem: React.FC<CommentListItemProps> = ({
    placeId,
    comment,
    isAuth,
    isAnswer,
    formAnswerId,
    onAnswerClick
}) => {
    const { t } = useTranslation('common', {
        keyPrefix: 'components.commentList'
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
                                onClick={() =>
                                    onAnswerClick?.(
                                        formAnswerId !== comment.id
                                            ? comment.id
                                            : undefined
                                    )
                                }
                                size={'s'}
                                mode={'link'}
                            >
                                {formAnswerId === comment.id
                                    ? t('answerCancel')
                                    : t('answerAdd')}
                            </Button>
                        )}
                    </div>

                    {formAnswerId === comment.id && (
                        <CommentForm
                            placeId={placeId}
                            answerId={comment.id}
                            isAuth={isAuth}
                            onCommentAdded={() => onAnswerClick?.(undefined)}
                        />
                    )}
                </div>
            </div>
        </div>
    )
}

export default CommentListItem
