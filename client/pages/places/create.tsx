import { GetServerSidePropsResult, NextPage } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { NextSeo } from 'next-seo'
import React from 'react'

import Breadcrumbs from '@/ui/breadcrumbs'
import Container from '@/ui/container'

import { wrapper } from '@/api/store'

import PageLayout from '@/components/page-layout'
import PlaceCreateForm from '@/components/place-form'

const PAGE_TITLE = 'Добавить интересное место'

interface CreatePlacePageProps {}

const CreatePlacePage: NextPage<CreatePlacePageProps> = () => {
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

export const getServerSideProps = wrapper.getServerSideProps(
    () =>
        async (
            context
        ): Promise<GetServerSidePropsResult<CreatePlacePageProps>> => {
            const locale = context.locale ?? 'en'

            const translations = await serverSideTranslations(locale)

            return {
                props: {
                    ...translations
                }
            }
        }
)

export default CreatePlacePage
