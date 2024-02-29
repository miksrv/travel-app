import { PHOTOS_PER_PAGE, UserPageProps } from '@/pages/users/[...slug]'
import { useTranslation } from 'next-i18next'
import { NextSeo } from 'next-seo'
import React from 'react'

import Container from '@/ui/container'
import Pagination from '@/ui/pagination'

import { SITE_LINK } from '@/api/api'

import Header from '@/components/header'
import UserGallery from '@/components/page-user/gallery'

interface PhotosProps extends Omit<UserPageProps, 'randomId' | 'page'> {}

const Photos: React.FC<PhotosProps> = ({
    id,
    user,
    photosList,
    photosCount,
    currentPage
}) => {
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

            <UserGallery photos={photosList} />

            <Container className={'pagination'}>
                <div>
                    {t('photos')} <strong>{photosCount ?? 0}</strong>
                </div>
                <Pagination
                    currentPage={currentPage}
                    totalPostCount={photosCount}
                    perPage={PHOTOS_PER_PAGE}
                    linkPart={`users/${id}/photos`}
                />
            </Container>
        </>
    )
}

export default Photos
