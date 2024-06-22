import { useTranslation } from 'next-i18next'
import React, { useState } from 'react'

import Button from '@/ui/button'

import { openAuthDialog } from '@/api/applicationSlice'
import { useAppDispatch, useAppSelector } from '@/api/store'
import { Comments } from '@/api/types/Comments'

import CommentForm from '@/components/comment-list/CommentForm'

import { concatClassNames as cn } from '@/functions/helpers'

import CommentListItem from './CommentListItem'
import styles from './styles.module.sass'

interface CommentListProps {
    placeId: string
    comments?: Comments[]
    loading?: boolean
}

const CommentList: React.FC<CommentListProps> = ({ placeId, comments }) => {
    const { t } = useTranslation('common', {
        keyPrefix: 'components.commentList'
    })

    const dispatch = useAppDispatch()
    const appAuth = useAppSelector((state) => state.auth)

    const [answerFormId, setAnswerFormId] = useState<string | undefined>()

    const handleLoginClick = (event: React.MouseEvent) => {
        event.preventDefault()
        dispatch(openAuthDialog())
    }

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
            {!!comments?.length && renderComments(comments)}

            {appAuth.isAuth && (
                <div className={styles.formSection}>
                    <CommentForm
                        placeId={placeId}
                        isAuth={appAuth.isAuth}
                        user={appAuth?.user}
                    />
                </div>
            )}

            {!appAuth.isAuth && (
                <div
                    className={cn(
                        styles.loginContainer,
                        !!comments?.length && styles.topBorder
                    )}
                >
                    <div>{t('loginForComment')}</div>
                    <Button
                        className={styles.loginButton}
                        onClick={handleLoginClick}
                    >
                        {t('userLogin')}
                    </Button>
                </div>
            )}
        </section>
    )
}

export default CommentList
