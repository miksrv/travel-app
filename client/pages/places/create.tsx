import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import { NextPage } from 'next'
import { NextSeo } from 'next-seo'
import React from 'react'

import Button from '@/ui/button'
import Container from '@/ui/container'

import PageLayout from '@/components/page-layout'
import PlaceCreateForm from '@/components/place-create-form'

import Breadcrumbs from '../../ui/breadcrumbs'

const PAGE_TITLE = 'Добавить интересное место'

const MapPage: NextPage = () => {
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

        // <PageLayout>
        //     <NextSeo title={PAGE_TITLE} />
        //     <Card sx={{ mb: 2 }}>
        //         <CardHeader
        //             title={PAGE_TITLE}
        //             titleTypographyProps={{ component: 'h1' }}
        //             subheader={
        //                 <Breadcrumbs
        //                     currentPage={'Добавить новое'}
        //                     links={[
        //                         {
        //                             link: '/places/',
        //                             text: 'Интересные места'
        //                         }
        //                     ]}
        //                 />
        //             }
        //             sx={{ mb: -1, mt: -1 }}
        //         />
        //     </Card>
        //
        //     <PlaceCreateForm />
        // </PageLayout>
    )
}

export default MapPage
