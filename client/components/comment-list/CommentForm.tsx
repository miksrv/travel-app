import React, { useEffect, useState } from 'react'

import Button from '@/ui/button'
import Textarea from '@/ui/textarea'

import { API } from '@/api/api'
import { User } from '@/api/types/User'

import UserAvatar from '@/components/user-avatar'

import styles from './styles.module.sass'

interface CommentFormProps {
    placeId: string
    answerId?: string
    isAuth?: boolean
    user?: User
    onCommentAdded?: () => void
}

const CommentForm: React.FC<CommentFormProps> = ({
    placeId,
    answerId,
    isAuth,
    user,
    onCommentAdded
}) => {
    const [comment, setComment] = useState<string | undefined>()

    const [submit, { isSuccess, isLoading }] = API.useCommentsPostMutation()

    const handleKeyPress = (
        event: React.KeyboardEvent<HTMLTextAreaElement>
    ) => {
        if (event.key === 'Enter' && comment && comment?.length > 0) {
            event.preventDefault()
            submit({
                answerId,
                comment,
                placeId
            })
        }
    }

    useEffect(() => {
        if (isSuccess && comment && comment?.length > 0) {
            setComment('')
            onCommentAdded?.()
        }
    }, [isSuccess, comment])

    return isAuth ? (
        <div className={styles.commentForm}>
            {user && (
                <UserAvatar
                    className={styles.userAvatar}
                    user={user}
                    size={'medium'}
                />
            )}

            <Textarea
                className={styles.textarea}
                value={comment}
                disabled={isLoading}
                onChange={setComment}
                onKeyDown={handleKeyPress}
                placeholder={'Напишите комментарий...'}
            />

            <Button
                className={styles.submitButton}
                loading={isLoading}
                disabled={isLoading || !comment}
                mode={'secondary'}
                icon={'Right'}
            />
        </div>
    ) : (
        <></>
    )
}

export default CommentForm
