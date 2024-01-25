import { PHOTOS_PER_PAGE, UserPageProps } from '@/pages/users/[...slug]'
import { NextSeo } from 'next-seo'
import React from 'react'

import Container from '@/ui/container'
import Pagination from '@/ui/pagination'

import Header from '@/components/header'
import UserGallery from '@/components/page-user/gallery'

interface PhotosProps extends Omit<UserPageProps, 'randomId' | 'page'> {}

const Photos: React.FC<PhotosProps> = ({
    id,
    user,
    photosList,
    photosCount,
    currentPage
}) => (
    <>
        <NextSeo title={user?.name} />
        <Header
            title={`${user?.name} - Фотографии`}
            currentPage={'Фотографии'}
            backLink={`/users/${id}`}
            links={[
                {
                    link: '/users/',
                    text: 'Путешественники'
                },
                {
                    link: `/users/${id}`,
                    text: user?.name || ''
                }
            ]}
        />
        <Container>
            <UserGallery photos={photosList} />
        </Container>
        <Container className={'pagination'}>
            <div>
                {'Фотографий: '}
                <strong>{photosCount ?? 0}</strong>
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

export default Photos
