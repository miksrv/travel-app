import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import React, { useMemo } from 'react'

import Container from '@/ui/container'
import Icon from '@/ui/icon'

import { API } from '@/api/api'
import { useAppSelector } from '@/api/store'
import { Place } from '@/api/types/Place'

import UserAvatar from '@/components/user-avatar'

import { convertDMS, formatDate } from '@/functions/helpers'

import googleLogo from '@/public/images/google-logo.png'
import yandexLogo from '@/public/images/yandex-logo.png'

import styles from './styles.module.sass'

const InteractiveMap = dynamic(() => import('@/components/interactive-map'), {
    ssr: false
})

interface InformationProps {
    place?: Place
    ratingCount?: number
    loading?: boolean
    onChangeWasHere?: (wasHere: boolean) => void
}

const Information: React.FC<InformationProps> = (props) => {
    const { place, ratingCount, loading, onChangeWasHere } = props

    const authSlice = useAppSelector((state) => state.auth)

    const [setRating, { data: newRating, isLoading: setRatingLoading }] =
        API.useRatingPutScoreMutation()

    const { data: visitedUsersData, isLoading: visitedUsersLoading } =
        API.useVisitedGetUsersListQuery(place?.id!, { skip: !place?.id })

    const iWasHere = useMemo(
        () =>
            !visitedUsersData?.items?.find(
                ({ id }) => id === authSlice?.user?.id
            )?.id,
        [visitedUsersData, authSlice]
    )

    const handleRatingChange = (value?: number) => {
        if (!value) {
            return
        }

        setRating({
            place: place?.id!,
            score: value
        })
    }

    React.useEffect(() => {
        onChangeWasHere?.(iWasHere)
    }, [visitedUsersData, authSlice])

    return (
        <Container className={styles.component}>
            <ul className={styles.information}>
                <li>
                    <Icon name={'Star'} />
                    <div className={styles.key}>{'Оценка пользователей:'}</div>
                    <div className={styles.value}>{place?.rating}</div>
                </li>
                <li>
                    <Icon name={'User'} />
                    <div className={styles.key}>{'Автор материала:'}</div>
                    <div className={styles.value}>
                        <UserAvatar
                            user={place?.author}
                            loading={loading}
                        />
                    </div>
                </li>
                <li>
                    <Icon name={'Point'} />
                    <div className={styles.key}>{'Координаты места:'}</div>
                    <div className={styles.value}>
                        <Link
                            color={'inherit'}
                            target={'_blank'}
                            href={`geo:${place?.latitude},${place?.longitude}`}
                        >
                            {`${convertDMS(
                                place?.latitude || 0,
                                place?.longitude || 0
                            )}`}
                        </Link>
                        <Link
                            className={styles.mapLink}
                            color={'inherit'}
                            target={'_blank'}
                            href={`https://yandex.ru/maps/?pt=${place?.longitude},${place?.latitude}&spn=0.1,0.1&l=sat,skl&z=14`}
                        >
                            <Image
                                src={yandexLogo.src}
                                width={16}
                                height={16}
                                alt={''}
                            />
                        </Link>
                        <Link
                            className={styles.mapLink}
                            target={'_blank'}
                            color={'inherit'}
                            href={`https://maps.google.com/maps?ll=${place?.latitude},${place?.longitude}&q=${place?.latitude},${place?.longitude}&spn=0.1,0.1&amp;t=h&amp;hl=ru`}
                        >
                            <Image
                                src={googleLogo.src}
                                width={16}
                                height={16}
                                alt={''}
                            />
                        </Link>
                    </div>
                </li>
                <li>
                    <Icon name={'Time'} />
                    <div className={styles.key}>{'Место добавлено:'}</div>
                    <div className={styles.value}>
                        {formatDate(place?.created?.date)}
                    </div>
                </li>
                <li>
                    <Icon name={'Time'} />
                    <div className={styles.key}>
                        {'Последнее редактирование:'}
                    </div>
                    <div className={styles.value}>
                        {formatDate(place?.updated?.date)}
                    </div>
                </li>
                <li>
                    <Icon name={'Address'} />
                    <div className={styles.key}>{'Адрес:'}</div>
                    <div className={styles.value}>
                        {place?.address?.country && (
                            <Link
                                color='inherit'
                                href={`/country/${place?.address.country.id}`}
                            >
                                {place?.address.country.name}
                            </Link>
                        )}
                        {place?.address?.region && (
                            <>
                                {place?.address?.country && ', '}
                                <Link
                                    color='inherit'
                                    href={`/region/${place?.address.region.id}`}
                                >
                                    {place?.address.region.name}
                                </Link>
                            </>
                        )}
                        {place?.address?.district && (
                            <>
                                {place?.address?.region && ', '}
                                <Link
                                    color='inherit'
                                    href={`/district/${place?.address.district.id}`}
                                >
                                    {place?.address.district.name}
                                </Link>
                            </>
                        )}
                        {place?.address?.city && (
                            <>
                                {place?.address?.district && ', '}
                                <Link
                                    color='inherit'
                                    href={`/city/${place?.address.city.id}`}
                                >
                                    {place?.address.city.name}
                                </Link>
                            </>
                        )}
                        {place?.address?.street && (
                            <>
                                {', '}
                                {place?.address?.street}
                            </>
                        )}
                    </div>
                </li>
            </ul>
            <div className={styles.map}>
                {place?.latitude && place?.longitude && (
                    <InteractiveMap
                        zoom={15}
                        center={[place.latitude, place.longitude]}
                        scrollWheelZoom={false}
                        places={[
                            {
                                category: place.category?.name!,
                                latitude: place.latitude,
                                longitude: place.longitude
                            }
                        ]}
                    />
                )}
            </div>
        </Container>
    )
}

export default Information
