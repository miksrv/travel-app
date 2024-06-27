import React, { useEffect, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useTranslation } from 'next-i18next'
import { NextSeo } from 'next-seo'
import type { BreadcrumbList, ProfilePage } from 'schema-dts'

import { API, IMG_HOST, SITE_LINK } from '@/api/api'
import type { Item } from '@/api/types/Activity'
import ActivityList from '@/components/activity-list/ActivityList'
import UserHeader from '@/components/page-user/header'
import UserTabs, { UserPagesEnum } from '@/components/page-user/tabs'
import PhotoGallery from '@/components/photo-gallery'
import { formatDateISO } from '@/functions/helpers'
import type { UserPageProps } from '@/pages/users/[...slug]'
import Button from '@/ui/button'
import Container from '@/ui/container'

interface UserProps extends Omit<UserPageProps, 'page'> {}

const User: React.FC<UserProps> = ({ id, user, photosList, photosCount }) => {
    const { t, i18n } = useTranslation('common', {
        keyPrefix: 'components.pageUser.user'
    })

    const canonicalUrl = SITE_LINK + (i18n.language === 'en' ? 'en/' : '')

    const [lastDate, setLastDate] = useState<string>()
    const [activityCache, setActivityCache] = useState<Item[]>([])

    const { data, isFetching } = API.useActivityGetInfinityListQuery({
        author: user?.id,
        date: lastDate
    })

    useEffect(() => {
        const onScroll = () => {
            const scrolledToBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 20

            if (scrolledToBottom && !isFetching && !!data?.items.length) {
                setLastDate(data.items[data.items.length - 1].created?.date)
            }
        }

        document.addEventListener('scroll', onScroll)

        return () => {
            document.removeEventListener('scroll', onScroll)
        }
    }, [lastDate, isFetching, data])

    useEffect(() => {
        if (data?.items) {
            setActivityCache([...(activityCache ?? []), ...data.items])
        }
    }, [data?.items])

    useEffect(() => {
        setActivityCache([])
        setLastDate(undefined)
    }, [id])

    const breadCrumbSchema: BreadcrumbList | any = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            {
                '@type': 'ListItem',
                item: `${canonicalUrl}users`,
                name: t('breadCrumbUsersLink'),
                position: 1
            },
            {
                '@type': 'ListItem',
                name: user?.name,
                position: 2
            }
        ]
    }

    const userSchema: ProfilePage | any = {
        '@context': 'https://schema.org',
        '@type': 'ProfilePage',
        dateCreated: formatDateISO(user?.created?.date),
        dateModified: formatDateISO(user?.updated?.date),
        mainEntity: {
            '@type': 'Person',
            identifier: user?.id,
            image: user?.avatar ? `${IMG_HOST}${user.avatar}` : undefined,
            name: user?.name
        }
    }

    return (
        <>
            <Head>
                <script
                    type={'application/ld+json'}
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(breadCrumbSchema)
                    }}
                />
                <script
                    type={'application/ld+json'}
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(userSchema)
                    }}
                />
            </Head>

            <NextSeo
                title={`${user?.name} - ${t('title')}`}
                canonical={`${canonicalUrl}users/${user?.id}`}
                description={`${user?.name} - ${t('description')}`}
                openGraph={{
                    images: photosList?.map((photo, index) => ({
                        alt: `${photo.title} (${index + 1})`,
                        height: photo.height,
                        url: `${IMG_HOST}${photo.full}`,
                        width: photo.width
                    })),
                    locale: i18n.language === 'ru' ? 'ru_RU' : 'en_US',
                    profile: {
                        username: user?.name
                    },
                    siteName: t('siteName'),
                    title: user?.name,
                    type: 'http://ogp.me/ns/profile#',
                    url: `${canonicalUrl}users/${user?.id}`
                }}
            />

            <UserHeader user={user} />

            <Container
                title={t('photos')}
                action={
                    !!photosList?.length && (
                        <Link
                            href={`/users/${id}/photos`}
                            title={t(`${t('buttonShowAllPhotos')} (${photosCount})`)}
                        >
                            {t('linkAllPhotos')}
                        </Link>
                    )
                }
                footer={
                    photosCount > 8 && (
                        <Button
                            size={'medium'}
                            mode={'secondary'}
                            stretched={true}
                            link={`/users/${id}/photos`}
                            style={{ marginTop: '15px' }}
                        >
                            {`${t('buttonShowAllPhotos')} (${photosCount})`}
                        </Button>
                    )
                }
            >
                <PhotoGallery
                    photos={photosList}
                    hideActions={true}
                />
            </Container>

            <UserTabs
                user={user}
                currentPage={UserPagesEnum.FEED}
            />

            <ActivityList
                activities={activityCache}
                loading={isFetching}
            />
        </>
    )
}

export default User
