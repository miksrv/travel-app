// import { useTranslation } from 'next-i18next'
import React from 'react'

import Container from '@/ui/container'

import { Comments } from '@/api/types/Comments'

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

    const renderComments = (comments: Comments[], answerId?: string) =>
        comments
            ?.filter((item) =>
                !answerId ? !item.answerId : item.answerId === answerId
            )
            ?.map((item) => (
                <React.Fragment key={item.id}>
                    <CommentListItem
                        isAnswer={!!answerId}
                        comment={item}
                    />

                    {renderComments(comments, item.id)}
                </React.Fragment>
            ))

    return comments?.length ? (
        <section className={styles.commentList}>
            {renderComments(comments)}
        </section>
    ) : (
        <Container className={styles.emptyList}>Пусто</Container>
    )
}

export default CommentList
