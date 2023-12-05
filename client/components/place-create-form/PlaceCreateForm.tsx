import { InputField } from '@/pages/_app'
import { Button } from '@mui/material'
import Autocomplete from '@mui/material/Autocomplete'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CircularProgress from '@mui/material/CircularProgress'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { LatLngBounds } from 'leaflet'
import debounce from 'lodash-es/debounce'
import dynamic from 'next/dynamic'
import React, { useCallback, useEffect, useState } from 'react'
import useGeolocation from 'react-hook-geolocation'

import { API } from '@/api/api'
import { login } from '@/api/authSlice'
import { useAppDispatch } from '@/api/store'
import { ApiTypes } from '@/api/types'

import ContentEditor from '@/components/content-editor'

import { round } from '@/functions/helpers'

interface LoginFormProps {}

const InteractiveMap = dynamic(() => import('@/components/interactive-map'), {
    ssr: false
})

export type LatLngCoordinate = {
    latitude: number
    longitude: number
}

const PlaceCreateForm: React.FC<LoginFormProps> = () => {
    const dispatch = useAppDispatch()
    const [formData, setFormState] = useState<ApiTypes.RequestAuthLogin>()
    const [authLoginPost, { isLoading, data: authData }] =
        API.useAuthPostLoginMutation()

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

    const [editorContent, setEditorContent] = React.useState<string>(' ')

    const handleChange = ({
        target: { name, value }
    }: React.ChangeEvent<HTMLInputElement>) => {
        setFormState((prev) => ({ ...prev, [name]: value }))
    }

    const handleLoginButton = () => {
        if (formData) {
            authLoginPost(formData)
        }
    }

    useEffect(() => {
        dispatch(login(authData))
    }, [authData])

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
        <Card sx={{ mb: 2, mt: 2 }}>
            <CardContent>
                <FormControl
                    variant={'standard'}
                    fullWidth={true}
                >
                    <InputLabel
                        shrink={true}
                        htmlFor={'title'}
                        sx={{ fontSize: '16px' }}
                    >
                        {'Заголовок интересного места'}
                    </InputLabel>
                    <InputField
                        name={'title'}
                        id={'title'}
                        onChange={handleChange}
                    />
                </FormControl>

                <Card sx={{ height: '260px', mb: 2, mt: 2 }}>
                    <InteractiveMap
                        storeMapPosition={false}
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
                </Card>

                <FormControl
                    variant={'standard'}
                    fullWidth={true}
                >
                    <InputLabel
                        shrink={true}
                        htmlFor={'title'}
                        sx={{ fontSize: '16px' }}
                    >
                        {'Адрес интересного места'}
                    </InputLabel>
                    <InputField
                        name={'address'}
                        id={'address'}
                        onChange={handleChange}
                    />
                </FormControl>

                <Box sx={{ mb: 2, mt: 2 }}>
                    <ContentEditor
                        markdown={' '}
                        onChange={setEditorContent}
                    />
                </Box>

                <FormControl
                    sx={{ m: 1, minWidth: 200, width: '100%' }}
                    size='small'
                >
                    <Autocomplete
                        multiple={true}
                        getOptionLabel={(option) =>
                            typeof option === 'string' ? option : ''
                        }
                        // loading={searchLoading}
                        filterOptions={(x) => x}
                        options={[]}
                        autoComplete
                        includeInputInList
                        filterSelectedOptions
                        // value={''}
                        noOptionsText='Нет найденных локаций'
                        // groupBy={(option) => option.type}
                        // onChange={(event, newValue) => {
                        //     onChangeLocation?.(newValue || undefined)
                        // }}
                        // onInputChange={(event, newInputValue) => {
                        //     if (newInputValue !== location?.title) {
                        //         setLocationLoading(true)
                        //     }
                        //
                        //     onSearchChange(newInputValue)
                        // }}
                        renderOption={(props, option) => (
                            <li {...props}>
                                <Typography variant='body1'>
                                    {/*{option.title}*/}
                                </Typography>
                            </li>
                        )}
                        renderInput={(params: any) => (
                            <TextField
                                {...params}
                                variant={'outlined'}
                                placeholder={'Поиск по локации'}
                                size={'small'}
                                InputProps={{
                                    ...params.InputProps
                                    // endAdornment: (
                                    //     <React.Fragment>
                                    //         {searchLoading ||
                                    //         locationLoading ? (
                                    //             <CircularProgress
                                    //                 color='inherit'
                                    //                 size={16}
                                    //             />
                                    //         ) : null}
                                    //         {params.InputProps.endAdornment}
                                    //     </React.Fragment>
                                    // )
                                }}
                            />
                        )}
                    />
                </FormControl>

                <Button
                    variant={'contained'}
                    size={'small'}
                    color={'primary'}
                    onClick={handleLoginButton}
                >
                    {'Добавить'}
                </Button>
            </CardContent>
        </Card>
    )
}
export default PlaceCreateForm
