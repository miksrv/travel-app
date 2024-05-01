import { UserPageProps } from '@/pages/users/[...slug]'
import { useTranslation } from 'next-i18next'
import { NextSeo } from 'next-seo'
import Head from 'next/head'
import React, { useEffect, useState } from 'react'
import { BreadcrumbList, ProfilePage } from 'schema-dts'

import Button from '@/ui/button'

import { API, IMG_HOST, SITE_LINK } from '@/api/api'
import { Item } from '@/api/types/Activity'

import ActivityList from '@/components/activity-list/ActivityList'
import UserGallery from '@/components/page-user/gallery'
import UserHeader from '@/components/page-user/header'
import UserTabs, { UserPagesEnum } from '@/components/page-user/tabs'

import { formatDateISO } from '@/functions/helpers'

interface UserProps extends Omit<UserPageProps, 'randomId' | 'page'> {}

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
            const scrolledToBottom =
                window.innerHeight + window.scrollY >=
                document.body.offsetHeight - 20

            if (scrolledToBottom && !isFetching && !!data?.items?.length) {
                setLastDate(data.items[data.items?.length - 1].created?.date)
            }
        }

        document.addEventListener('scroll', onScroll)

        return function () {
            document.removeEventListener('scroll', onScroll)
        }
    }, [lastDate, isFetching, data])

    useEffect(() => {
        if (data?.items) {
            setActivityCache([...(activityCache || []), ...data.items])
        }
    }, [data?.items])

    useEffect(() => {
        setActivityCache([])
        setLastDate(undefined)
    }, [id])

    const breadCrumbSchema: BreadcrumbList = {
        // @ts-ignore
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

    const userSchema: ProfilePage = {
        // @ts-ignore
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
                title={user?.name}
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

            <UserGallery
                title={t('photos')}
                photos={photosList}
                hideActions={true}
                footer={
                    photosCount > 8 && (
                        <Button
                            size={'m'}
                            mode={'secondary'}
                            stretched={true}
                            link={`/users/${id}/photos`}
                            style={{ marginTop: '15px' }}
                        >
                            {`${t('buttonShowAllPhotos')} (${photosCount})`}
                        </Button>
                    )
                }
            />

            <UserTabs
                user={user}
                currentPage={UserPagesEnum.FEED}
            />

            <ActivityList
                activities={activityCache}
                loading={true}
            />
        </>
    )
}

export default User
