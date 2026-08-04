import React from 'react'
import { Container, Icon, IconTypes } from 'simple-react-ui-kit'

import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslation } from 'next-i18next/pages'

import { ApiModel } from '@/api'
import { CopyCoordinates, MapLinks, UserAvatar, UserAvatarGroup } from '@/components/shared'
import { categoryImage } from '@/utils/categories'
import { formatDate, formatThousands } from '@/utils/helpers'

import styles from './styles.module.sass'

const InteractiveMap = dynamic(() => import('@/components/map/InteractiveMap'), { ssr: false })

interface PlaceInfoSidebarProps {
    place?: ApiModel.Place
}

interface SidebarInfoItem {
    icon: IconTypes
    key: string
    value: React.ReactNode
}

export const PlaceInfoSidebar: React.FC<PlaceInfoSidebarProps> = ({ place }) => {
    const { t } = useTranslation()

    const infoItems: Array<SidebarInfoItem | false> = [
        {
            icon: 'Bookmark',
            key: t('category'),
            value: place?.category && (
                <Link
                    href={`/places?category=${place.category.name}`}
                    title={`${place.category.title} - ${t('all-geotags-at-address')}`}
                    className={styles.categoryLink}
                >
                    <Image
                        src={categoryImage(place.category.name).src}
                        alt={''}
                        width={16}
                        height={16}
                    />
                    {place.category.title}
                </Link>
            )
        },
        {
            icon: 'User',
            key: t('author'),
            value: (
                <UserAvatar
                    user={place?.author}
                    showName={true}
                />
            )
        },
        !!place?.editors?.length && {
            icon: 'Users',
            key: t('editors'),
            value:
                place.editors.length === 1 ? (
                    <UserAvatar
                        user={place.editors[0]}
                        showName={true}
                    />
                ) : (
                    <UserAvatarGroup
                        size={'small'}
                        users={place.editors}
                    />
                )
        },
        {
            icon: 'Eye',
            key: t('views'),
            value: formatThousands(place?.views || 0)
        },
        !!place?.created && {
            icon: 'Time',
            key: t('created'),
            value: formatDate(place.created.date, t('date-time-format'))
        },
        !!place?.updated && {
            icon: 'Time',
            key: t('edited'),
            value: formatDate(place.updated.date, t('date-time-format'))
        },
        !!place?.distance && {
            icon: 'Ruler',
            key: t('distance-to-me'),
            value: `${formatThousands(place.distance)} ${t('km')}`
        },
        {
            icon: 'Position',
            key: t('coordinates'),
            value: (
                <CopyCoordinates
                    lat={place?.lat || 0}
                    lon={place?.lon || 0}
                />
            )
        }
    ]

    return (
        <Container className={styles.component}>
            <ul>
                {infoItems
                    .filter((item): item is SidebarInfoItem => !!item)
                    .map((item) => (
                        <li key={item.key}>
                            <Icon name={item.icon} />
                            <div className={styles.info}>
                                <div className={styles.key}>{item.key}</div>
                                <div className={styles.value}>{item.value}</div>
                            </div>
                        </li>
                    ))}
            </ul>

            {place?.id && place.category && (
                <div className={styles.map}>
                    <InteractiveMap
                        zoom={14}
                        center={[place.lat, place.lon]}
                        enableFullScreen={false}
                        scrollWheelZoom={false}
                        dragging={false}
                        controlsSize={'small'}
                        fullMapLink={`/map#${place.lat},${place.lon},14`}
                        places={[{ category: place.category.name, lat: place.lat, lon: place.lon }]}
                    />
                </div>
            )}

            <ul className={styles.mapLinks}>
                <MapLinks
                    title={place?.title}
                    lat={place?.lat ?? 0}
                    lon={place?.lon ?? 0}
                    showTitle={true}
                    asListItem={true}
                />
            </ul>
        </Container>
    )
}
