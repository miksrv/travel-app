import { useTranslation } from 'next-i18next'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'

import Badge from '@/ui/badge'
import { BreadcrumbLink } from '@/ui/breadcrumbs'
import Button from '@/ui/button'
import RatingColored from '@/ui/rating-colored'

import { IMG_HOST } from '@/api/api'
import { openAuthDialog } from '@/api/applicationSlice'
import { useAppDispatch, useAppSelector } from '@/api/store'
import { Place } from '@/api/types/Place'

import Header from '@/components/header'
import PlaceCoverEditor from '@/components/place-cover-editor'

import {
    addDecimalPoint,
    dateToUnixTime,
    numberFormatter
} from '@/functions/helpers'

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

    const dispatch = useAppDispatch()
    const authSlice = useAppSelector((state) => state.auth)
    const [coverHash, setCoverHash] = useState<string | number>('')

    const handleEditPlaceClick = (event: React.MouseEvent) => {
        if (!authSlice.isAuth) {
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

    useEffect(() => {
        setCoverHash(dateToUnixTime(place?.updated?.date))
    }, [])

    return (
        <section className={styles.component}>
            <div className={styles.topPanel}>
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

            <div className={styles.image}>
                {place?.cover && (
                    <Image
                        alt={place?.title || ''}
                        height={300}
                        width={870}
                        src={`${IMG_HOST}${place.cover.full}${
                            coverHash ? `?d=${coverHash}` : ''
                        }`}
                    />
                )}
            </div>

            <div className={styles.bottomPanel}>
                <Badge
                    icon={'Photo'}
                    content={place?.photos || 0}
                />

                {!!place?.comments && (
                    <Badge
                        icon={'Comment'}
                        content={numberFormatter(place.comments)}
                    />
                )}

                <Badge
                    icon={'Eye'}
                    content={place?.views || 0}
                />
                {/*<Badge*/}
                {/*    icon={'Ruler'}*/}
                {/*    content={`${place?.distance || '?'} км`}*/}
                {/*/>*/}
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
                                authSlice.isAuth
                                    ? `/places/${place?.id}/edit`
                                    : undefined
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
