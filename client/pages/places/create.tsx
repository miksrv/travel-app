import { GetServerSidePropsResult, NextPage } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { NextSeo } from 'next-seo'
import React from 'react'

import Container from '@/ui/container'

import { wrapper } from '@/api/store'

import Header from '@/components/header'
import PageLayout from '@/components/page-layout'
import PlaceCreateForm from '@/components/place-form'

const PAGE_TITLE = 'Добавить интересное место'

interface CreatePlacePageProps {}

const CreatePlacePage: NextPage<CreatePlacePageProps> = () => (
    <PageLayout>
        <NextSeo title={PAGE_TITLE} />
        <Header
            title={PAGE_TITLE}
            currentPage={'Добавить новое'}
            links={[
                {
                    link: '/places/',
                    text: 'Интересные места'
                }
            ]}
        />
        <Container>
            <PlaceCreateForm />
        </Container>
    </PageLayout>
)

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
