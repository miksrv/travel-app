import { Article, ListItem, Person } from 'schema-dts'

import { IMG_HOST } from '@/api/api'
import { Place } from '@/api/types/Place'
import { User } from '@/api/types/User'

import { formatDateISO } from '@/functions/helpers'

export const ListItemSchema = (data: any[]): ListItem => ({
    // @ts-ignore
    '@context': 'https://schema.org',
    '@type': 'ListItem',
    itemListElement: data
})

export const PlaceSchema = (place: Place, canonicalUrl: string): Article => ({
    // @ts-ignore
    '@context': 'https://schema.org',
    '@type': 'Article',
    articleBody: place?.content,
    author: {
        '@type': 'Person',
        image: place?.author?.avatar
            ? `${IMG_HOST}${place?.author?.avatar}`
            : undefined,
        name: place?.author?.name,
        url: `${canonicalUrl}users/${place?.author?.id}`
    },
    contentLocation: {
        '@type': 'Place',
        address: {
            '@type': 'PostalAddress',
            addressCountry: place?.address?.country?.title,
            addressLocality: place?.address?.locality?.title,
            addressRegion: place?.address?.region?.title,
            streetAddress: place?.address?.street
        },
        geo: {
            '@type': 'GeoCoordinates',
            latitude: place?.lat,
            longitude: place?.lon
        }
    },
    dateModified: formatDateISO(place?.updated?.date),
    datePublished: formatDateISO(place?.created?.date),
    headline: place?.title,
    image: place?.cover?.preview
        ? `${IMG_HOST}${place?.cover?.preview}`
        : undefined,
    interactionStatistic: {
        '@type': 'InteractionCounter',
        userInteractionCount: place?.views
    }
})

export const UserSchema = (user: User): Person => ({
    // @ts-ignore
    '@context': 'https://schema.org',
    '@type': 'Person',
    identifier: user?.id,
    image: user?.avatar ? `${IMG_HOST}${user.avatar}` : undefined,
    name: user?.name
})
