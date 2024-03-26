import React, { useState } from 'react'

import { useAppSelector } from '@/api/store'
import { Comments } from '@/api/types/Comments'

import CommentForm from '@/components/comment-list/CommentForm'

import CommentListItem from './CommentListItem'
import styles from './styles.module.sass'

interface CommentListProps {
    placeId: string
    comments?: Comments[]
    loading?: boolean
}

const CommentList: React.FC<CommentListProps> = ({ placeId, comments }) => {
    const appAuth = useAppSelector((state) => state.auth)

    const [answerFormId, setAnswerFormId] = useState<string | undefined>()

    const renderComments = (comments: Comments[], answerId?: string) =>
        comments
            ?.filter((item) =>
                !answerId ? !item.answerId : item.answerId === answerId
            )
            ?.map((item) => (
                <React.Fragment key={item.id}>
                    <CommentListItem
                        placeId={placeId}
                        isAuth={appAuth.isAuth}
                        isAnswer={!!answerId}
                        comment={item}
                        formAnswerId={answerFormId}
                        onAnswerClick={setAnswerFormId}
                    />

                    {renderComments(comments, item.id)}
                </React.Fragment>
            ))

    return (
        <section className={styles.commentList}>
            {comments?.length ? (
                renderComments(comments)
            ) : (
                <div className={styles.emptyList}>
                    {'Пока нет комментариев, станьте первым!'}
                </div>
            )}

            {appAuth.isAuth && (
                <div className={styles.formSection}>
                    <CommentForm
                        placeId={placeId}
                        isAuth={appAuth.isAuth}
                        user={appAuth?.user}
                    />
                </div>
            )}
        </section>
    )
}

export default CommentList
