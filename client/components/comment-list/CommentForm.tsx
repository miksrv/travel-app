import React, { useState } from 'react'

import Button from '@/ui/button'
import Textarea from '@/ui/textarea'

import { User } from '@/api/types/User'

import UserAvatar from '@/components/user-avatar'

import styles from './styles.module.sass'

interface CommentFormProps {
    isAuth?: boolean
    user?: User
}

const CommentForm: React.FC<CommentFormProps> = ({ isAuth, user }) => {
    const [comment, setComment] = useState<string | undefined>()

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
                onChange={setComment}
                placeholder={'Напишите комментарий...'}
            />
            <Button
                className={styles.submitButton}
                mode={'secondary'}
                icon={'Right'}
            />
        </div>
    ) : (
        <></>
    )
}

export default CommentForm
