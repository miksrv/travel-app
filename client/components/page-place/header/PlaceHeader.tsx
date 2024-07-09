import React, { useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'

import styles from './styles.module.sass'

import { IMG_HOST } from '@/api/api'
import { openAuthDialog } from '@/api/applicationSlice'
import { useAppDispatch, useAppSelector } from '@/api/store'
import { ApiTypes } from '@/api/types'
import { Place } from '@/api/types/Place'
import BookmarkButton from '@/components/bookmark-button'
import Button from '@/ui/button'
import Icon from '@/ui/icon'
import Popout from '@/ui/popout'

interface PlaceHeaderProps {
    place?: Place
    coverHash?: number
    onPhotoUploadClick?: (event?: React.MouseEvent) => void
    onChangePlaceCoverClick?: (event?: React.MouseEvent) => void
}

type PlaceAddress = {
    id?: number
    name?: string
    type: ApiTypes.LocationTypes
}

const PlaceHeader: React.FC<PlaceHeaderProps> = ({ place, coverHash, onPhotoUploadClick, onChangePlaceCoverClick }) => {
    const router = useRouter()
    const dispatch = useAppDispatch()
    const { t } = useTranslation()

    const isAuth = useAppSelector((state) => state.auth.isAuth)

    const placeAddress: PlaceAddress[] = useMemo(() => {
        const addressTypes: ApiTypes.LocationTypes[] = ['country', 'region', 'district', 'locality']
        const address: PlaceAddress[] = []

        addressTypes.forEach((type) => {
            if (place?.address?.[type]?.id) {
                address.push({
                    id: place?.address[type]?.id,
                    name: place?.address[type]?.title,
                    type
                })
            }
        })

        return address
    }, [place?.address])

    const handleEditPlaceClick = (event: React.MouseEvent) => {
        if (!isAuth) {
            event.preventDefault()
            dispatch(openAuthDialog())
        }
    }

    const handleBackLinkClick = async () => {
        if (!document.referrer) {
            await router.push('/places')
        } else {
            router.back()
        }
    }

    return (
        <section className={styles.placeHeader}>
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
                    onClick={handleBackLinkClick}
                    icon={'Left'}
                />

                <div className={styles.actionButtons}>
                    <BookmarkButton
                        size={'medium'}
                        placeId={place?.id}
                    />

                    <Popout
                        className={styles.contextMenu}
                        action={<Icon name={'VerticalDots'} />}
                    >
                        <ul className={'contextListMenu'}>
                            <li>
                                <Link
                                    href={`/map#${place?.lat},${place?.lon},14`}
                                    title={t('open-on-map')}
                                >
                                    <Icon name={'Map'} />
                                    {t('open-on-map')}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href={'#'}
                                    title={t('upload-photo')}
                                    onClick={onPhotoUploadClick}
                                >
                                    <Icon name={'Camera'} />
                                    {t('upload-photo')}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href={'#'}
                                    title={t('change-cover')}
                                    onClick={onChangePlaceCoverClick}
                                >
                                    <Icon name={'Photo'} />
                                    {t('change-cover')}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href={isAuth ? `/places/${place?.id}/edit` : '#'}
                                    onClick={handleEditPlaceClick}
                                    title={t('edit')}
                                >
                                    <Icon name={'EditLocation'} />
                                    {t('edit')}
                                </Link>
                            </li>
                        </ul>
                    </Popout>
                </div>
            </div>

            <div className={styles.bottomPanel}>
                <h1>{place?.title}</h1>
                <div className={styles.address}>
                    {placeAddress.map((address, i) => (
                        <span key={`address${address.type}`}>
                            <Link
                                href={`/places?${address.type}=${address.id}`}
                                title={`${t('all-geotags-at-address')} ${address.name}`}
                            >
                                {address.name}
                            </Link>
                            {placeAddress.length - 1 !== i && ', '}
                        </span>
                    ))}

                    {place?.address?.street && <>{`, ${place.address.street}`}</>}
                </div>
            </div>
        </section>
    )
}

export default PlaceHeader
