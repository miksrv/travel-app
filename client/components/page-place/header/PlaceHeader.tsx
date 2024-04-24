import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'

import Badge from '@/ui/badge'
import { BreadcrumbLink } from '@/ui/breadcrumbs'
import Button from '@/ui/button'
import RatingColored from '@/ui/rating-colored'

import { IMG_HOST } from '@/api/api'
import { openAuthDialog } from '@/api/applicationSlice'
import { useAppDispatch, useAppSelector } from '@/api/store'
import { Place } from '@/api/types/Place'

import BookmarkButton from '@/components/bookmark-button'
import Header from '@/components/header'
import PlaceCoverEditor from '@/components/place-cover-editor'

import { addDecimalPoint, dateToUnixTime } from '@/functions/helpers'

import styles from './styles.module.sass'

interface PlaceHeaderProps {
    place?: Place
    breadcrumbs?: BreadcrumbLink[]
    ratingValue?: number
    ratingCount?: number
}

const PlaceHeader: React.FC<PlaceHeaderProps> = ({
    place,
    breadcrumbs,
    ratingValue,
    ratingCount
}) => {
    const { t } = useTranslation('common', {
        keyPrefix: 'components.pagePlace.placeHeader'
    })

    const router = useRouter()
    const dispatch = useAppDispatch()
    const isAuth = useAppSelector((state) => state.auth?.isAuth)
    const [coverHash, setCoverHash] = useState<string | number>('')

    const handleEditPlaceClick = (event: React.MouseEvent) => {
        if (!isAuth) {
            event.stopPropagation()
            dispatch(openAuthDialog())
        }
    }

    const handleSaveCover = () => {
        setTimeout(
            () => setCoverHash(Math.floor(Date.now() / 1000).toString()),
            400
        )
    }

    const handleBackLinkClick = async () => {
        if (document?.referrer) {
            await router.push('/places')
        } else {
            router.back()
        }
    }

    useEffect(() => {
        setCoverHash(dateToUnixTime(place?.updated?.date))
    }, [])

    return (
        <section className={styles.component}>
            <div className={styles.image}>
                {place?.cover && (
                    <>
                        <div
                            className={styles.desktop}
                            style={{
                                backgroundImage: `url(${IMG_HOST}${
                                    place.cover.full
                                }${coverHash ? `?d=${coverHash}` : ''})`
                            }}
                        />

                        <div
                            className={styles.mobile}
                            style={{
                                backgroundImage: `url(${IMG_HOST}${
                                    place.cover.preview
                                }${coverHash ? `?d=${coverHash}` : ''})`
                            }}
                        />
                    </>
                )}
            </div>

            <div className={styles.topPanel}>
                <Button
                    className={styles.backLink}
                    icon={'Left'}
                    onClick={handleBackLinkClick}
                />

                {(place?.rating || (!!ratingCount && ratingValue)) && (
                    <RatingColored
                        className={styles.rating}
                        value={ratingValue}
                    >
                        <div className={styles.value}>
                            {addDecimalPoint(ratingValue ?? place?.rating)}
                        </div>
                        <div className={styles.count}>
                            {t('ratingCount', { count: ratingCount ?? 0 })}
                        </div>
                    </RatingColored>
                )}
            </div>

            <div className={styles.bottomPanel}>
                <div>
                    <Badge
                        icon={'Photo'}
                        content={place?.photos || 0}
                    />

                    {!!place?.comments && (
                        <Badge
                            icon={'Comment'}
                            content={place.comments}
                        />
                    )}

                    {!!place?.bookmarks && (
                        <Badge
                            icon={'HeartEmpty'}
                            content={place.bookmarks}
                        />
                    )}

                    <Badge
                        icon={'Eye'}
                        content={place?.views || 0}
                    />

                    {place?.distance && (
                        <Badge
                            icon={'Ruler'}
                            content={`${place?.distance} ${t('km')}`}
                        />
                    )}
                </div>

                <div>
                    <BookmarkButton
                        size={'m'}
                        placeId={place?.id}
                    />
                </div>
            </div>

            <Header
                title={place?.title}
                currentPage={place?.title}
                attachedBottom={true}
                links={breadcrumbs}
                actions={
                    <>
                        <PlaceCoverEditor
                            placeId={place?.id}
                            onSaveCover={handleSaveCover}
                        />

                        <Button
                            size={'m'}
                            icon={'EditLocation'}
                            mode={'secondary'}
                            link={
                                isAuth ? `/places/${place?.id}/edit` : undefined
                            }
                            onClick={handleEditPlaceClick}
                        >
                            {t('buttonEdit')}
                        </Button>
                    </>
                }
            />
        </section>
    )
}

export default PlaceHeader
