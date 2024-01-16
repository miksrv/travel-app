import { NextPage } from 'next'
import { NextSeo } from 'next-seo'
import React from 'react'

import Container from '@/ui/container'

import PageLayout from '@/components/page-layout'
import PlaceCreateForm from '@/components/place-form'

import Breadcrumbs from '../../ui/breadcrumbs'

const PAGE_TITLE = 'Добавить интересное место'

const CreatePlacePage: NextPage = () => {
    return (
        <PageLayout>
            <NextSeo title={PAGE_TITLE} />
            <Container className={'pageHeader'}>
                <header>
                    <h1>{PAGE_TITLE}</h1>
                    <Breadcrumbs
                        currentPage={'Добавить новое'}
                        links={[
                            {
                                link: '/places/',
                                text: 'Интересные места'
                            }
                        ]}
                    />
                </header>
            </Container>
            <Container>
                <PlaceCreateForm />
            </Container>
        </PageLayout>
    )
}

export default CreatePlacePage
