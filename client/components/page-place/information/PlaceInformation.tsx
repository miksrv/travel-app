import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import React, { useMemo } from 'react'

import Container from '@/ui/container'
import Icon from '@/ui/icon'
import Rating from '@/ui/rating'

import { API } from '@/api/api'
import { ApiTypes } from '@/api/types'
import { Place } from '@/api/types/Place'

import UserAvatar from '@/components/user-avatar'

import { convertDMS, formatDate } from '@/functions/helpers'

import googleLogo from '@/public/images/google-logo.png'
import yandexLogo from '@/public/images/yandex-logo.png'

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
    ratingValue?: number | null
    loading?: boolean
    // onChangeWasHere?: (wasHere: boolean) => void
}

const PlaceInformation: React.FC<PlaceInformationProps> = (props) => {
    const { place, ratingValue } = props

    // const authSlice = useAppSelector((state) => state.auth)

    // const { data: visitedUsersData, isLoading: visitedUsersLoading } =
    //     API.useVisitedGetUsersListQuery(place?.id!, { skip: !place?.id })

    const [changeRating, { isLoading: ratingLoading }] =
        API.useRatingPutScoreMutation()

    const placeAddress: PlaceAddress[] = useMemo(() => {
        const addressTypes: ApiTypes.LocationTypes[] = [
            'country',
            'region',
            'district',
            'city'
        ]
        let address: PlaceAddress[] = []

        addressTypes.forEach((type) => {
            if (place?.address?.[type]?.id) {
                address.push({
                    id: place.address[type]?.id,
                    name: place.address[type]?.title,
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

    const handleRatingChange = (value?: number) => {
        if (value && place?.id) {
            changeRating({
                place: place.id,
                score: value
            })
        }
    }

    // React.useEffect(() => {
    //     onChangeWasHere?.(iWasHere)
    // }, [visitedUsersData, authSlice])

    return (
        <Container className={styles.component}>
            <ul className={styles.information}>
                <li>
                    <Icon name={'Star'} />
                    <div className={styles.key}>{'Оценка пользователей:'}</div>
                    <div className={styles.value}>
                        <Rating
                            value={ratingValue ?? undefined}
                            disabled={ratingLoading}
                            onChange={handleRatingChange}
                        />
                    </div>
                </li>
                <li>
                    <Icon name={'User'} />
                    <div className={styles.key}>{'Автор материала:'}</div>
                    <div className={styles.value}>
                        <UserAvatar
                            user={place?.author}
                            showName={true}
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
                            href={`geo:${place?.lat},${place?.lon}`}
                        >
                            {`${convertDMS(place?.lat || 0, place?.lon || 0)}`}
                        </Link>
                        <Link
                            className={styles.mapLink}
                            color={'inherit'}
                            target={'_blank'}
                            href={`https://yandex.ru/maps/?pt=${place?.lon},${place?.lat}&spn=0.1,0.1&l=sat,skl&z=14`}
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
                            href={`https://maps.google.com/maps?ll=${place?.lat},${place?.lon}&q=${place?.lat},${place?.lon}&spn=0.1,0.1&amp;t=h&amp;hl=ru`}
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
                        {placeAddress?.map((address, i) => (
                            <>
                                <Link
                                    key={`address${address.type}`}
                                    href={`/places?${address.type}=${address.id}`}
                                    title={`Интересные места: ${address.name}`}
                                >
                                    {address.name}
                                </Link>
                                {placeAddress.length - 1 !== i && ', '}
                            </>
                        ))}

                        {place?.address?.street && (
                            <>{`, ${place?.address?.street}`}</>
                        )}
                    </div>
                </li>
            </ul>
            <div className={styles.map}>
                {place?.lat && place?.lon && (
                    <InteractiveMap
                        zoom={15}
                        center={[place.lat, place.lon]}
                        enableFullScreen={true}
                        scrollWheelZoom={false}
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