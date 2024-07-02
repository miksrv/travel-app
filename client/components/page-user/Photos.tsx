import React from 'react'
import { useTranslation } from 'next-i18next'
import { NextSeo } from 'next-seo'

import { SITE_LINK } from '@/api/api'
import Header from '@/components/header'
import UserTabs, { UserPagesEnum } from '@/components/page-user/tabs'
import PhotoGallery from '@/components/photo-gallery'
import { PHOTOS_PER_PAGE, UserPageProps } from '@/pages/users/[...slug]'
import Container from '@/ui/container'
import Pagination from '@/ui/pagination'

interface UserPhotosProps extends Omit<UserPageProps, 'page' | 'placesList'> {}

const UserPhotos: React.FC<UserPhotosProps> = ({ id, user, photosList, photosCount, currentPage }) => {
    const { t, i18n } = useTranslation()

    const canonicalUrl = SITE_LINK + (i18n.language === 'en' ? 'en/' : '')
    const pageTitle = currentPage > 1 ? ` - ${t('page')} ${currentPage}` : ''

    return (
        <>
            <NextSeo
                title={`${user?.name} - ${t('photos')}${pageTitle}`}
                description={`${user?.name} - ${t('all-traveler-photos')}${pageTitle}`}
                canonical={`${canonicalUrl}users/${id}/photos`}
            />

            <Header
                title={`${user?.name} - ${t('photos')}${pageTitle}`}
                currentPage={t('photos')}
                backLink={`/users/${id}`}
                userData={user}
                links={[
                    {
                        link: '/users/',
                        text: t('users')
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

            <Container>
                <PhotoGallery photos={photosList} />
            </Container>

            <Container className={'pagination'}>
                <div>
                    {t('photos')}: <strong>{photosCount ?? 0}</strong>
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
