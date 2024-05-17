import { PLACES_PER_PAGE, UserPageProps } from '@/pages/users/[...slug]'
import { useTranslation } from 'next-i18next'
import { NextSeo } from 'next-seo'
import React from 'react'

import Container from '@/ui/container'
import Pagination from '@/ui/pagination'

import { API, SITE_LINK } from '@/api/api'

import Header from '@/components/header'
import UserTabs, { UserPagesEnum } from '@/components/page-user/tabs'
import PlacesList from '@/components/places-list'

interface UserPlacesProps extends Omit<UserPageProps, 'page' | 'placesList'> {
    type: 'places' | 'bookmarks'
}

const UserPlaces: React.FC<UserPlacesProps> = ({
    id,
    user,
    currentPage,
    type
}) => {
    const { t, i18n } = useTranslation('common', {
        keyPrefix: 'components.pageUser.places'
    })

    const { data, isLoading } = API.usePlacesGetListQuery({
        author: type === 'places' ? id : undefined,
        bookmarkUser: type === 'bookmarks' ? id : undefined,
        limit: PLACES_PER_PAGE,
        offset: (currentPage - 1) * PLACES_PER_PAGE
    })

    const canonicalUrl = SITE_LINK + (i18n.language === 'en' ? 'en/' : '')
    const pageTitle = currentPage > 1 ? ` - ${t('page')} ${currentPage}` : ''
    const title = type === 'places' ? t('title') : t('favorites')

    return (
        <>
            <NextSeo
                title={`${user?.name} - ${title}${pageTitle}`}
                description={`${user?.name} - ${t('description')}${pageTitle}`}
                canonical={`${canonicalUrl}users/${id}/${
                    type === 'places' ? 'places' : 'bookmarks'
                }`}
            />

            <Header
                title={`${user?.name} - ${title}${pageTitle}`}
                currentPage={title}
                backLink={`/users/${id}`}
                userData={user}
                links={[
                    {
                        link: '/users/',
                        text: t('breadCrumbLink')
                    },
                    {
                        link: `/users/${id}`,
                        text: user?.name || ''
                    }
                ]}
            />

            <UserTabs
                user={user}
                currentPage={type as UserPagesEnum}
            />

            <PlacesList
                places={data?.items}
                loading={isLoading}
            />

            <Container className={`pagination${!data?.count && ' hide'}`}>
                <div>
                    {t('count')} <strong>{data?.count ?? 0}</strong>
                </div>

                <Pagination
                    currentPage={currentPage}
                    totalItemsCount={data?.count ?? 0}
                    perPage={PLACES_PER_PAGE}
                    linkPart={`users/${id}/${type}`}
                />
            </Container>
        </>
    )
}

export default UserPlaces
