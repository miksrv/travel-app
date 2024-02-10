import { UserPageProps } from '@/pages/users/[...slug]'
import { useTranslation } from 'next-i18next'
import { NextSeo } from 'next-seo'
import React from 'react'

import Button from '@/ui/button'
import Container from '@/ui/container'

import UserGallery from '@/components/page-user/gallery'
import UserHeader from '@/components/page-user/header'

interface UserProps extends Omit<UserPageProps, 'randomId' | 'page'> {}

const User: React.FC<UserProps> = ({ id, user, photosList, photosCount }) => {
    const { t } = useTranslation('common', {
        keyPrefix: 'components.pageUser.user'
    })

    return (
        <>
            <NextSeo title={user?.name} />

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
