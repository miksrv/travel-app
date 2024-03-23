import React, { useState } from 'react'

import Textarea from '@/ui/textarea'

import styles from './styles.module.sass'

interface CommentFormProps {}

const CommentForm: React.FC<CommentFormProps> = () => {
    const [comment, setComment] = useState<string | undefined>()

    return (
        <div className={styles.commentForm}>
            <Textarea
                value={comment}
                onChange={setComment}
                placeholder={'Напишите комментарий...'}
            />
        </div>
    )
}

export default CommentForm
