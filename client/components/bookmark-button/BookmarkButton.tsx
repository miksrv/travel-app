import React from 'react'

import Button from '@/ui/button'

import { API } from '@/api/api'
import { openAuthDialog } from '@/api/applicationSlice'
import { useAppDispatch, useAppSelector } from '@/api/store'

import styles from './styles.module.sass'

interface BookmarkButtonProps {
    placeId?: string
}

const BookmarkButton: React.FC<BookmarkButtonProps> = ({ placeId }) => {
    const dispatch = useAppDispatch()

    const isAuth = useAppSelector((state) => state.auth?.isAuth)

    const [setBookmark, { isLoading: bookmarkPutLoading }] =
        API.useBookmarksPutPlaceMutation()

    const { data: bookmarkData, isLoading: bookmarksLoading } =
        API.useBookmarksGetPlaceQuery(
            { placeId: placeId! },
            { skip: !placeId || !isAuth }
        )

    const handleButtonClick = () => {
        if (!isAuth) {
            dispatch(openAuthDialog())
        } else if (isAuth && placeId) {
            setBookmark({ placeId })
        }
    }

    return (
        <Button
            size={'m'}
            mode={'secondary'}
            icon={bookmarkData?.result ? 'HeartFull' : 'HeartEmpty'}
            className={styles.bookmarkButton}
            disabled={!placeId || bookmarkPutLoading || bookmarksLoading}
            loading={bookmarkPutLoading || bookmarksLoading}
            onClick={handleButtonClick}
        />
    )
}

export default BookmarkButton
