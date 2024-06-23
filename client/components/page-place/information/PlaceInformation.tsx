import { useTranslation } from 'next-i18next'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import React, { useMemo } from 'react'

import Container from '@/ui/container'
import Icon from '@/ui/icon'

import { ApiTypes } from '@/api/types'
import { Place } from '@/api/types/Place'

import MapLinks from '@/components/map-links'
import UserAvatar from '@/components/user-avatar'
import UserAvatarGroup from '@/components/user-avatar-group'

import { categoryImage } from '@/functions/categories'
import { convertDMS } from '@/functions/coordinates'
import { formatDate } from '@/functions/helpers'

import styles from './styles.module.sass'

const InteractiveMap = dynamic(() => import('@/components/interactive-map'), {
    ssr: false
})

type PlaceAddress = {
    id?: number
    name?: string
    type: ApiTypes.LocationTypes
}

interface PlaceInformationProps {
    place?: Place
    // onChangeWasHere?: (wasHere: boolean) => void
}

const PlaceInformation: React.FC<PlaceInformationProps> = ({ place }) => {
    const { t } = useTranslation('common', {
        keyPrefix: 'components.pagePlace.placeInformation'
    })

    // const { data: visitedUsersData, isLoading: visitedUsersLoading } =
    //     API.useVisitedGetUsersListQuery(place?.id!, { skip: !place?.id })

    const placeAddress: PlaceAddress[] = useMemo(() => {
        const addressTypes: ApiTypes.LocationTypes[] = [
            'country',
            'region',
            'district',
            'locality'
        ]
        let address: PlaceAddress[] = []

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

    // const iWasHere = useMemo(
    //     () =>
    //         !visitedUsersData?.items?.find(
    //             ({ id }) => id === authSlice?.user?.id
    //         )?.id,
    //     [visitedUsersData, authSlice]
    // )

    // React.useEffect(() => {
    //     onChangeWasHere?.(iWasHere)
    // }, [visitedUsersData, authSlice])

    return (
        <Container className={styles.component}>
            <ul className={styles.information}>
                <li>
                    <Icon name={'Category'} />
                    <div className={styles.key}>{t('category')}</div>
                    <div className={styles.value}>
                        <Image
                            src={categoryImage(place?.category?.name)?.src}
                            alt={''}
                            width={15}
                            height={18}
                            style={{ marginRight: '4px' }}
                        />
                        <Link
                            href={`/places?category=${place?.category?.name}`}
                            title={`${place?.category?.title} - ${t(
                                'allCategoryPlaces'
                            )}`}
                        >
                            {place?.category?.title}
                        </Link>
                    </div>
                </li>
                <li>
                    <Icon name={'User'} />
                    <div className={styles.key}>{t('author')}</div>
                    <div className={styles.value}>
                        <UserAvatar
                            user={place?.author}
                            showName={true}
                        />
                    </div>
                </li>
                {!!place?.editors?.length && (
                    <li>
                        <Icon name={'Users'} />
                        <div className={styles.key}>{t('editors')}</div>
                        <div className={styles.value}>
                            {place?.editors?.length === 1 ? (
                                <UserAvatar
                                    user={place?.editors?.[0]}
                                    showName={true}
                                />
                            ) : (
                                <UserAvatarGroup
                                    size={'small'}
                                    users={place?.editors}
                                />
                            )}
                        </div>
                    </li>
                )}
                <li>
                    <Icon name={'Eye'} />
                    <div className={styles.key}>{t('views')}</div>
                    <div className={styles.value}>{place?.views || 0}</div>
                </li>
                {place?.updated && (
                    <li>
                        <Icon name={'Time'} />
                        <div className={styles.key}>{t('editTime')}</div>
                        <div className={styles.value}>
                            {formatDate(place?.updated?.date, t('dateFormat'))}
                        </div>
                    </li>
                )}
                {place?.distance && (
                    <li>
                        <Icon name={'Ruler'} />
                        <div className={styles.key}>{t('distance')}</div>
                        <div className={styles.value}>
                            {`${place?.distance} ${t('km')}`}
                        </div>
                    </li>
                )}
                <li>
                    <Icon name={'Point'} />
                    <div className={styles.key}>{t('coordinates')}</div>
                    <div className={styles.value}>
                        <Link
                            className={styles.coordinatesLink}
                            color={'inherit'}
                            target={'_blank'}
                            href={`geo:${place?.lat},${place?.lon}`}
                        >
                            {convertDMS(place?.lat || 0, place?.lon || 0)}
                        </Link>
                        <MapLinks
                            title={place?.title}
                            lat={place?.lat!}
                            lon={place?.lon!}
                        />
                    </div>
                </li>
                <li>
                    <Icon name={'Address'} />
                    <div className={styles.key}>{t('address')}</div>
                    <div
                        className={styles.value}
                        style={{ display: 'block' }}
                    >
                        {placeAddress?.map((address, i) => (
                            <span key={`address${address.type}`}>
                                <Link
                                    href={`/places?${address.type}=${address.id}`}
                                    title={`${t('addressLinkTitle')} ${
                                        address.name
                                    }`}
                                >
                                    {address.name}
                                </Link>
                                {placeAddress.length - 1 !== i && ', '}
                            </span>
                        ))}

                        {place?.address?.street && (
                            <>{`, ${place?.address?.street}`}</>
                        )}
                    </div>
                </li>
            </ul>
            <div className={styles.map}>
                {place?.id && (
                    <InteractiveMap
                        zoom={15}
                        center={[place.lat, place.lon]}
                        enableFullScreen={false}
                        scrollWheelZoom={false}
                        dragging={false}
                        fullMapLink={`/map#${place.lat},${place.lon},14`}
                        places={[
                            {
                                category: place.category?.name!,
                                lat: place.lat,
                                lon: place.lon
                            }
                        ]}
                    />
                )}
            </div>
        </Container>
    )
}

export default PlaceInformation
