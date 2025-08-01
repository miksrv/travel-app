import React from 'react'
import { TFunction } from 'i18next'
import { Button, Container, Icon } from 'simple-react-ui-kit'

import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'

import { ApiModel } from '@/api'
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

interface PlaceInformationProps {
    t: TFunction
    place?: ApiModel.Place
}

const PlaceInformation: React.FC<PlaceInformationProps> = ({ t, place }) => (
    <Container className={styles.component}>
        <ul className={styles.information}>
            <li>
                <Icon name={'Bookmark'} />
                <div className={styles.key}>{t('category')}</div>
                <div className={styles.value}>
                    <Image
                        src={categoryImage(place?.category?.name).src}
                        alt={''}
                        width={15}
                        height={18}
                        style={{ marginRight: '4px' }}
                    />
                    <Link
                        href={`/places?category=${place?.category?.name}`}
                        title={`${place?.category?.title} - ${t('all-geotags-at-address')}`}
                    >
                        {place?.category?.title}
                    </Link>
                </div>
            </li>
            <li>
                <Icon name={'User'} />
                <div className={styles.key}>{t('author')}:</div>
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
                    <div className={styles.key}>{t('editors')}:</div>
                    <div className={styles.value}>
                        {place.editors.length === 1 ? (
                            <UserAvatar
                                user={place.editors[0]}
                                showName={true}
                            />
                        ) : (
                            <UserAvatarGroup
                                size={'small'}
                                users={place.editors}
                            />
                        )}
                    </div>
                </li>
            )}
            <li>
                <Icon name={'Eye'} />
                <div className={styles.key}>{t('views')}:</div>
                <div className={styles.value}>{place?.views || 0}</div>
            </li>
            {place?.updated && (
                <li>
                    <Icon name={'Time'} />
                    <div className={styles.key}>{t('edited')}</div>
                    <div className={styles.value}>{formatDate(place.updated.date, t('date-time-format'))}</div>
                </li>
            )}
            {place?.distance && (
                <li>
                    <Icon name={'Ruler'} />
                    <div className={styles.key}>{t('distance-to-me')}:</div>
                    <div className={styles.value}>{`${place.distance} ${t('km')}`}</div>
                </li>
            )}
            <li>
                <Icon name={'Point'} />
                <div className={styles.key}>{t('coordinates')}:</div>
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
                        lat={place?.lat ?? 0}
                        lon={place?.lon ?? 0}
                    />
                </div>
            </li>
        </ul>
        <div className={styles.map}>
            {place?.id && place.category && (
                <InteractiveMap
                    zoom={15}
                    center={[place.lat, place.lon]}
                    enableFullScreen={false}
                    scrollWheelZoom={false}
                    dragging={false}
                    fullMapLink={`/map#${place.lat},${place.lon},14`}
                    places={[
                        {
                            category: place.category.name,
                            lat: place.lat,
                            lon: place.lon
                        }
                    ]}
                />
            )}

            <Button
                className={styles.openMapButton}
                style={{ width: '100%' }}
                mode={'primary'}
                link={`/map#${place?.lat},${place?.lon},14`}
                disabled={!place?.lat || !place?.lon}
            >
                {t('open-on-map')}
            </Button>
        </div>
    </Container>
)

export default PlaceInformation
