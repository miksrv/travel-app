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

const LayersOptions: MapLayerItem[] = [
    {
        label: 'Схема (MabBox)',
        layer: 'MabBox'
    },
    {
        label: 'Схема (OSM)',
        layer: 'OSM'
    },
    {
        label: 'Карта (Google)',
        layer: 'GoogleMap'
    },
    {
        label: 'Спутник (Google)',
        layer: 'GoogleSat'
    }
]

interface LayerSwitcherControl {
    currentLayer?: MapLayersType
    onSwitchMapLayer?: (layer: MapLayersType) => void
}

const LayerSwitcherControl: React.FC<LayerSwitcherControl> = ({
    currentLayer,
    onSwitchMapLayer
}) => {
    const [open, setOpen] = useState<boolean>(false)

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
