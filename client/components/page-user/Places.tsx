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

interface UserPlacesProps
    extends Omit<UserPageProps, 'randomId' | 'page' | 'placesList'> {}

const UserPlaces: React.FC<UserPlacesProps> = ({ id, user, currentPage }) => {
    const { t, i18n } = useTranslation('common', {
        keyPrefix: 'components.pageUser.places'
    })

    const { data } = API.usePlacesGetListQuery({
        author: id,
        limit: PLACES_PER_PAGE,
        offset: 0
    })

    const canonicalUrl = SITE_LINK + (i18n.language === 'en' ? 'en/' : '')
    const pageTitle = currentPage > 1 ? ` - ${t('page')} ${currentPage}` : ''

    return (
        <>
            <NextSeo
                title={`${user?.name} - ${t('title')}${pageTitle}`}
                description={`${user?.name} - ${t('description')}${pageTitle}`}
                canonical={`${canonicalUrl}users/${id}/photos`}
            />

            <Header
                title={`${user?.name} - ${t('title')}${pageTitle}`}
                currentPage={t('title')}
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
                currentPage={UserPagesEnum.PLACES}
            />

            <PlacesList places={data?.items} />

            <Container className={'pagination'}>
                <div>
                    {t('count')} <strong>{data?.count ?? 0}</strong>
                </div>

                <Pagination
                    currentPage={currentPage}
                    totalItemsCount={data?.count ?? 0}
                    perPage={PLACES_PER_PAGE}
                    linkPart={`users/${id}/places`}
                />
            </Container>
        </>
    )
}

export default UserPlaces
