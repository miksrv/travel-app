import { PlacePageProps } from '@/pages/places/[...slug]'
import { NextSeo } from 'next-seo'
import React from 'react'

import Container from '@/ui/container'

import Header from '@/components/header'
import PlaceForm from '@/components/place-form'

interface EditProps extends Omit<PlacePageProps, 'randomId' | 'page'> {}

const Edit: React.FC<EditProps> = ({ place }) => (
    <>
        <NextSeo title={`${place?.title} - Редактирование`} />

        <Header
            title={`${place?.title} - Редактирование`}
            currentPage={'Редактирование'}
            backLink={`/places/${place?.id}`}
            links={[
                {
                    link: '/places/',
                    text: 'Интересные места'
                },
                {
                    link: `/places/${place?.id}`,
                    text: place?.title || ''
                }
            ]}
        />

        <Container>
            <PlaceForm
                placeId={place?.id}
                values={{
                    category: place?.category?.name,
                    content: place?.content,
                    coordinates: { lat: place?.lat!, lon: place?.lon! },
                    tags: place?.tags?.map(({ title }) => title),
                    title: place?.title
                }}
            />
        </Container>
    </>
)

export default Edit
