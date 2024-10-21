import React from 'react'
import { useTranslation } from 'next-i18next'
import { Container } from 'simple-react-ui-kit'

import { API } from '@/api/api'
import CommentList from '@/components/comment-list'

interface CommentsProps {
    placeId: string
}

const Comments: React.FC<CommentsProps> = ({ placeId }) => {
    const { t } = useTranslation()

    const { data, isLoading } = API.useCommentsGetListQuery({
        place: placeId
    })

    return (
        <Container
            style={{ marginTop: 15 }}
            title={t('comments-title')}
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
