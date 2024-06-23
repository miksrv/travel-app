import { useTranslation } from 'next-i18next'
import React, { useEffect, useState } from 'react'

import Button, { ButtonProps } from '@/ui/button'

import { API } from '@/api/api'
import { openAuthDialog } from '@/api/applicationSlice'
import { Notify } from '@/api/notificationSlice'
import { useAppDispatch, useAppSelector } from '@/api/store'

import styles from './styles.module.sass'

interface BookmarkButtonProps extends ButtonProps {
    placeId?: string
}

const BookmarkButton: React.FC<BookmarkButtonProps> = ({
    placeId,
    ...props
}) => {
    const dispatch = useAppDispatch()
    const { t } = useTranslation('common', {
        keyPrefix: 'components.bookmarkButton'
    })

    const [buttonPushed, setButtonPushed] = useState<boolean>(false)

    const isAuth = useAppSelector((state) => state.auth?.isAuth)

    const [setBookmark, { isLoading: bookmarkPutLoading, data: result }] =
        API.useBookmarksPutPlaceMutation()

    const {
        data: bookmarkData,
        isLoading: bookmarksLoading,
        isFetching
    } = API.useBookmarksGetPlaceQuery(
        { placeId: placeId! },
        { skip: !placeId || !isAuth }
    )

    const loading = bookmarkPutLoading || bookmarksLoading || isFetching

    const handleButtonClick = (event: React.MouseEvent) => {
        event.stopPropagation()

        if (!isAuth) {
            dispatch(openAuthDialog())
        } else if (isAuth && placeId) {
            setBookmark({ placeId })
            setButtonPushed(true)
        }
    }

    useEffect(() => {
        if (!buttonPushed) {
            return
        }

        dispatch(
            Notify({
                id: 'bookmarkButton',
                message: bookmarkData?.result
                    ? t('bookmarkResultRemove')
                    : t('bookmarkResultAdd'),
                type: 'success'
            })
        )
    }, [result])

    return (
        <Button
            {...props}
            mode={'secondary'}
            icon={bookmarkData?.result ? 'HeartFull' : 'HeartEmpty'}
            className={styles.bookmarkButton}
            disabled={!placeId || loading}
            loading={loading}
            onClick={handleButtonClick}
        />
    )
}

export default BookmarkButton
