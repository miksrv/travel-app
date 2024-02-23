import { UserPageProps } from '@/pages/users/[...slug]'
import { useTranslation } from 'next-i18next'
import { NextSeo } from 'next-seo'
import React from 'react'

import Button from '@/ui/button'
import Container from '@/ui/container'

import { IMG_HOST, SITE_LINK } from '@/api/api'

import UserGallery from '@/components/page-user/gallery'
import UserHeader from '@/components/page-user/header'

interface UserProps extends Omit<UserPageProps, 'randomId' | 'page'> {}

const User: React.FC<UserProps> = ({ id, user, photosList, photosCount }) => {
    const { t, i18n } = useTranslation('common', {
        keyPrefix: 'components.pageUser.user'
    })

    const pageUrl = `${SITE_LINK}${i18n.language === 'en' ? 'en/' : ''}places/${
        user?.id
    }`

    return (
        <>
            <NextSeo
                title={user?.name}
                canonical={pageUrl}
                description={`${user?.name} - ${t('description')}`}
                openGraph={{
                    images: photosList?.map((photo, index) => ({
                        alt: `${photo.title} (${index + 1})`,
                        height: photo.height,
                        url: `${IMG_HOST}${photo.full}`,
                        width: photo.width
                    })),
                    locale: i18n.language,
                    profile: {
                        username: user?.name
                    },
                    siteName: t('siteName'),
                    title: user?.name,
                    type: 'profile',
                    url: pageUrl
                }}
            />

            <UserHeader user={user} />

            <Container title={t('title')}>
                <UserGallery photos={photosList} />

                {photosCount > 8 && (
                    <Button
                        size={'m'}
                        mode={'secondary'}
                        stretched={true}
                        link={`/users/${id}/photos`}
                        style={{ marginTop: '15px' }}
                    >
                        {`${t('buttonShowAllPhotos')} (${photosCount})`}
                    </Button>
                )}
            </Container>
        </>
    )
}

export default User
