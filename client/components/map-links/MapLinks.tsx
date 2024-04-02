import { useTranslation } from 'next-i18next'
import Image, { StaticImageData } from 'next/image'
import Link from 'next/link'
import React from 'react'

import { ApiTypes } from '@/api/types'

import googleLogo from '@/public/images/google-logo.png'
import wikimapiaLogo from '@/public/images/wikimapia-logo.png'
import yandexLogo from '@/public/images/yandex-logo.png'

import styles from './styles.module.sass'

const DEFAULT_ZOOM = 17

interface ServiceMapLinkProps {
    link: string
    title?: string
    translate?: string
    showTitle?: boolean
    image?: StaticImageData
}

const ServiceMapLink: React.FC<ServiceMapLinkProps> = ({
    link,
    image,
    title,
    translate,
    showTitle
}) => (
    <Link
        className={styles.mapLink}
        color={'inherit'}
        target={'_blank'}
        title={`${title ? `${title} ` : ''}${translate}`}
        href={link}
    >
        {image && (
            <Image
                src={image.src}
                width={14}
                height={14}
                alt={translate || ''}
            />
        )}
        {showTitle && translate}
    </Link>
)

interface MapLinksProps extends ApiTypes.LatLonCoordinate {
    zoom?: number
    title?: string
    showTitle?: boolean
}

const MapLinks: React.FC<MapLinksProps> = (props) => (
    <>
        <Yandex {...props} />
        <Google {...props} />
        <Wikimapia {...props} />
    </>
)

const Yandex: React.FC<MapLinksProps> = (props) => {
    const { t } = useTranslation('common', {
        keyPrefix: 'components.mapLinks'
    })

    return (
        <ServiceMapLink
            {...props}
            image={yandexLogo}
            translate={t('yandexMap')}
            link={`https://yandex.ru/maps/?pt=${props.lon},${
                props.lat
            }&spn=0.1,0.1&l=sat,skl&z=${props.zoom ?? DEFAULT_ZOOM}`}
        />
    )
}

const Google: React.FC<MapLinksProps> = (props) => {
    const { t, i18n } = useTranslation('common', {
        keyPrefix: 'components.mapLinks'
    })

    return (
        <ServiceMapLink
            {...props}
            image={googleLogo}
            translate={t('googleMap')}
            link={`https://maps.google.com/maps?ll=${props?.lat},${
                props?.lon
            }&q=${props?.lat},${props?.lon}&z=${
                props.zoom ?? DEFAULT_ZOOM
            }&spn=0.1,0.1&t=h&hl=${i18n.language}`}
        />
    )
}

const Wikimapia: React.FC<MapLinksProps> = (props) => {
    const { t, i18n } = useTranslation('common', {
        keyPrefix: 'components.mapLinks'
    })

    return (
        <ServiceMapLink
            {...props}
            image={wikimapiaLogo}
            translate={t('wikimapiaMap')}
            link={`https://wikimapia.org/#lang=${i18n.language}&lat=${
                props?.lat
            }&lon=${props?.lon}&z=${props.zoom ?? DEFAULT_ZOOM}&m=w`}
        />
    )
}

export default MapLinks
export { Yandex, Google, Wikimapia }
