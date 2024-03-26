// import { useTranslation } from 'next-i18next'
import React, { useState } from 'react'

import Container from '@/ui/container'

import { useAppSelector } from '@/api/store'
import { Comments } from '@/api/types/Comments'

import CommentForm from '@/components/comment-list/CommentForm'

import CommentListItem from './CommentListItem'
import styles from './styles.module.sass'

interface CommentListProps {
    comments?: Comments[]
    loading?: boolean
}

const CommentList: React.FC<CommentListProps> = ({ comments }) => {
    // const { t } = useTranslation('common', {
    //     keyPrefix: 'components.placesList'
    // })

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
                        isAuth={appAuth.isAuth}
                        isAnswer={!!answerId}
                        comment={item}
                        formAnswerId={answerFormId}
                        onAnswerClick={setAnswerFormId}
                    />

                    {renderComments(comments, item.id)}
                </React.Fragment>
            ))

    return comments?.length ? (
        <section className={styles.commentList}>
            {renderComments(comments)}

            {appAuth.isAuth && (
                <div className={styles.formSection}>
                    <CommentForm
                        isAuth={appAuth.isAuth}
                        user={appAuth?.user}
                    />
                </div>
            )}
        </section>
    ) : (
        <Container className={styles.emptyList}>Пусто</Container>
    )
}

export default CommentList
