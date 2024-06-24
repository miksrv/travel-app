import React from 'react'
import { useTranslation } from 'next-i18next'

import styles from './styles.module.sass'

import { API } from '@/api/api'
import CommentList from '@/components/comment-list'
import Container from '@/ui/container'

interface CommentsProps {
    placeId: string
}

const Comments: React.FC<CommentsProps> = ({ placeId }) => {
    const { t } = useTranslation('common', {
        keyPrefix: 'components.pagePlace.placeComments'
    })

    const { data, isLoading } = API.useCommentsGetListQuery({
        place: placeId
    })

    return (
        <Container
            className={styles.component}
            title={t('title')}
        >
            <CommentList
                placeId={placeId}
                comments={data?.items}
                loading={isLoading}
            />
        </Container>
    )
}

export default Comments
