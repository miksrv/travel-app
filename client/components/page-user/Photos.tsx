import React from 'react'
import { useTranslation } from 'next-i18next'
import { NextSeo } from 'next-seo'

import { SITE_LINK } from '@/api/api'
import Header from '@/components/header'
import UserGallery from '@/components/page-user/gallery'
import UserTabs, { UserPagesEnum } from '@/components/page-user/tabs'
import { PHOTOS_PER_PAGE, UserPageProps } from '@/pages/users/[...slug]'
import Container from '@/ui/container'
import Pagination from '@/ui/pagination'

interface UserPhotosProps extends Omit<UserPageProps, 'page' | 'placesList'> {}

const UserPhotos: React.FC<UserPhotosProps> = ({ id, user, photosList, photosCount, currentPage }) => {
    const { t, i18n } = useTranslation('common', {
        keyPrefix: 'components.pageUser.photos'
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
                currentPage={UserPagesEnum.PHOTOS}
            />

            <UserGallery photos={photosList} />

            <Container className={'pagination'}>
                <div>
                    {t('photos')} <strong>{photosCount ?? 0}</strong>
                </div>

                <Pagination
                    currentPage={currentPage}
                    totalItemsCount={photosCount}
                    perPage={PHOTOS_PER_PAGE}
                    linkPart={`users/${id}/photos`}
                />
            </Container>
        </>
    )
}

export default UserPhotos
