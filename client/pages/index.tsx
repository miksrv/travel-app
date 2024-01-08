import { Button } from '@mui/material'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import { LatLngBounds } from 'leaflet'
import debounce from 'lodash-es/debounce'
import { type GetStaticProps, NextPage } from 'next'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { NextSeo } from 'next-seo'
import dynamic from 'next/dynamic'
import React, { useCallback, useEffect, useState } from 'react'
import useGeolocation from 'react-hook-geolocation'

import Container from '@/ui/container'
import MapIcon from '@/ui/map-icon'

import { API } from '@/api/api'

import PageLayout from '@/components/page-layout'

import { round } from '@/functions/helpers'

import Breadcrumbs from '../ui/breadcrumbs'

const InteractiveMap = dynamic(() => import('@/components/interactive-map'), {
    ssr: false
})

export type LatLngCoordinate = {
    latitude: number
    longitude: number
}

const IndexPage: NextPage = () => {
    const { t } = useTranslation('common', { keyPrefix: 'page.index' })

    // const searchParams = useSearchParams()
    // const router = useRouter()
    const geolocation = useGeolocation()

    const [myCoordinates, setMyCoordinates] = useState<LatLngCoordinate>()
    const [mapBounds, setMapBounds] = useState<string>()

    // const lat = searchParams.get('lat')
    // const lon = searchParams.get('lon')

    const [introduce] = API.useIntroduceMutation()
    const { data: poiListData } = API.usePoiGetListQuery(
        { bounds: mapBounds },
        { skip: !mapBounds }
    )

    const debounceSetMapBounds = useCallback(
        debounce((bounds: LatLngBounds) => {
            setMapBounds(bounds.toBBoxString())
        }, 500),
        []
    )

    useEffect(() => {
        const updateLatitude = round(geolocation?.latitude)
        const updateLongitude = round(geolocation?.longitude)

        if (
            updateLatitude &&
            updateLongitude &&
            updateLatitude !== myCoordinates?.latitude &&
            updateLongitude !== myCoordinates?.longitude
        ) {
            setMyCoordinates({
                latitude: updateLatitude,
                longitude: updateLongitude
            })

            introduce({ lat: updateLatitude, lon: updateLongitude })
        }
    }, [geolocation.latitude, geolocation.longitude])

    return (
        <PageLayout
            title={t('title')}
            breadcrumb={t('breadcrumb')}
        >
            <NextSeo title={t('title')} />
            <MapIcon
                name={'Forest'}
                height={'32px'}
            />
            <MapIcon
                name={'Mount'}
                height={'32px'}
            />
            <Container style={{ height: 'calc(100vh - 150px)', padding: 0 }}>
                <InteractiveMap
                    storeMapPosition={true}
                    places={poiListData?.items}
                    onChangeBounds={debounceSetMapBounds}
                    userLatLng={
                        geolocation.latitude && geolocation.longitude
                            ? {
                                  lat: geolocation.latitude,
                                  lng: geolocation.longitude
                              }
                            : undefined
                    }
                />
            </Container>
        </PageLayout>
    )
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
    props: {
        ...(await serverSideTranslations(locale ?? 'ru'))
    }
})

export default IndexPage
