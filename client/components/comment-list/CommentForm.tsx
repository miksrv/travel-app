import React, { useState } from 'react'
import { useTranslation } from 'next-i18next'
import { Button } from 'simple-react-ui-kit'

import styles from './styles.module.sass'

import { API, ApiModel } from '@/api'
import UserAvatar from '@/components/user-avatar'
import Textarea from '@/ui/textarea'

interface CommentFormProps {
    placeId: string
    answerId?: string
    isAuth?: boolean
    user?: ApiModel.User
    onCommentAdded?: () => void
}

const CommentForm: React.FC<CommentFormProps> = ({ placeId, answerId, isAuth, user, onCommentAdded }) => {
    const { t } = useTranslation()

    const [comment, setComment] = useState<string | undefined>()

    const [submit, { isLoading }] = API.useCommentsPostMutation()

    const handleKeyPress = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === 'Enter' && comment && comment.length > 1) {
            event.preventDefault()
            handleSubmit()
        }
    }

    const handleSubmit = () => {
        submit({
            answerId,
            comment,
            placeId
        })

        setComment('')
        onCommentAdded?.()
    }

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
                placeholder={t('write-comment')}
            />

            <Button
                icon={'KeyboardRight'}
                mode={'secondary'}
                className={styles.submitButton}
                loading={isLoading}
                disabled={isLoading || !comment}
                onClick={handleSubmit}
            />
        </div>
    ) : (
        <></>
    )
}

export default CommentForm
