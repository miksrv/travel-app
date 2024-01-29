import Image from 'next/image'
import React from 'react'

import Badge from '@/ui/badge'
import { BreadcrumbLink } from '@/ui/breadcrumbs'
import Button from '@/ui/button'

import { IMG_HOST } from '@/api/api'
import { openAuthDialog } from '@/api/applicationSlice'
import { useAppDispatch, useAppSelector } from '@/api/store'
import { Place } from '@/api/types/Place'

import Header from '@/components/header'

import {
    addDecimalPoint,
    concatClassNames as cn,
    ratingColor
} from '@/functions/helpers'

import noPhoto from '@/public/images/no-photo-available.png'

import styles from './styles.module.sass'

interface PlaceHeaderProps {
    place?: Place
    breadcrumbs?: BreadcrumbLink[]
    ratingValue?: number
    ratingCount?: number
}

const PlaceHeader: React.FC<PlaceHeaderProps> = ({
    breadcrumbs,
    place,
    ratingValue,
    ratingCount
}) => {
    const dispatch = useAppDispatch()
    const authSlice = useAppSelector((state) => state.auth)

    const handleEditPlaceClick = (event: React.MouseEvent) => {
        if (!authSlice.isAuth) {
            event.stopPropagation()
            dispatch(openAuthDialog())
        }
    }

    return (
        <section className={styles.component}>
            <div className={styles.topPanel}>
                {!!ratingCount && (
                    <div
                        className={cn(
                            styles.rating,
                            styles[ratingColor(ratingValue || 0)]
                        )}
                    >
                        <div className={styles.value}>
                            {addDecimalPoint(ratingValue || 0)}
                        </div>
                        <div className={styles.count}>{ratingCount} голоса</div>
                    </div>
                )}
            </div>
            <Image
                className={styles.image}
                alt={place?.photo?.title || ''}
                height={300}
                width={1100}
                src={
                    place?.photo?.filename
                        ? `${IMG_HOST}photo/${place?.id}/${place?.photo?.filename}.${place?.photo?.extension}`
                        : noPhoto.src
                }
            />
            <div className={styles.bottomPanel}>
                <Badge
                    icon={'Photo'}
                    content={place?.photoCount || 0}
                />
                <Badge
                    icon={'Eye'}
                    content={place?.views || 0}
                />
                <Badge
                    icon={'Ruler'}
                    content={`${place?.distance || '?'} км`}
                />
            </div>
            <Header
                title={place?.title}
                currentPage={place?.title}
                attachedBottom={true}
                links={breadcrumbs}
                actions={
                    <Button
                        size={'m'}
                        icon={'EditLocation'}
                        mode={'primary'}
                        link={
                            authSlice.isAuth
                                ? `/places/${place?.id}/edit`
                                : undefined
                        }
                        onClick={handleEditPlaceClick}
                    >
                        {'Редактировать'}
                    </Button>
                }
            />
        </section>
    )
}

export default PlaceHeader
