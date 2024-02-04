import { useTranslation } from 'next-i18next'
import React, { useState } from 'react'

import Button from '@/ui/button'
import Container from '@/ui/container'
import RadioButton from '@/ui/radio-button'

import { MapLayersType } from './InteractiveMap'
import styles from './styles.module.sass'

type MapLayerItem = {
    layer: MapLayersType
    label: string
}

interface LayerSwitcherControlProps {
    currentLayer?: MapLayersType
    onSwitchMapLayer?: (layer: MapLayersType) => void
}

const LayerSwitcherControl: React.FC<LayerSwitcherControlProps> = ({
    currentLayer,
    onSwitchMapLayer
}) => {
    const [open, setOpen] = useState<boolean>(false)
    const { t } = useTranslation('common', {
        keyPrefix: 'components.interactiveMap.layerSwitcher'
    })

    const LayersOptions: MapLayerItem[] = [
        {
            label: t('layerMapBox'),
            layer: 'MabBox'
        },
        {
            label: t('layerOSM'),
            layer: 'OSM'
        },
        {
            label: t('layerGoogleMap'),
            layer: 'GoogleMap'
        },
        {
            label: t('layerGoogleSat'),
            layer: 'GoogleSat'
        },
        {
            label: t('layerMapBoxSat'),
            layer: 'MapBoxSat'
        }
    ]

    const handleToogleOpen = () => {
        setOpen(!open)
    }

    const handleSwitchMapLayer = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setOpen(false)
        onSwitchMapLayer?.(event.target.id as MapLayersType)
    }

    return (
        <>
            {!open ? (
                <Button
                    mode={'secondary'}
                    icon={'Layers'}
                    onClick={handleToogleOpen}
                />
            ) : (
                <Container className={styles.mapLayersContainer}>
                    <ul className={styles.mapLayersList}>
                        {LayersOptions.map((item) => (
                            <li key={item.layer}>
                                <RadioButton
                                    id={item.layer}
                                    label={item.label}
                                    name={'layerType'}
                                    checked={currentLayer === item.layer}
                                    onChange={handleSwitchMapLayer}
                                    onClick={() => setOpen(false)}
                                />
                            </li>
                        ))}
                    </ul>
                </Container>
            )}
        </>
    )
}

export default LayerSwitcherControl
