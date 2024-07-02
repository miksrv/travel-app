import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'next-i18next'

import {
    MapAdditionalLayers,
    MapAdditionalLayersType,
    MapLayers,
    MapLayersType,
    MapObjects,
    MapObjectsType
} from './InteractiveMap'
import styles from './styles.module.sass'

import Button from '@/ui/button'
import Checkbox from '@/ui/checkbox'
import Container from '@/ui/container'
import RadioButton from '@/ui/radio-button'

interface LayerSwitcherControlProps {
    currentLayer?: MapLayersType
    currentType?: MapObjectsType
    additionalLayers?: MapAdditionalLayersType[]
    onSwitchMapLayer?: (layer: MapLayersType) => void
    onSwitchMapType?: (type: MapObjectsType) => void
    onSwitchAdditionalLayers?: (layer?: MapAdditionalLayersType[]) => void
}

const LayerSwitcherControl: React.FC<LayerSwitcherControlProps> = ({
    currentLayer,
    currentType,
    additionalLayers,
    onSwitchMapLayer,
    onSwitchMapType,
    onSwitchAdditionalLayers
}) => {
    const { t } = useTranslation()

    const layersContainerRef = useRef<HTMLDivElement>(null)
    const [open, setOpen] = useState<boolean>(false)

    const handleToggleOpen = () => {
        setOpen(!open)
    }

    const handleClickOutside = (event: MouseEvent) => {
        if (layersContainerRef.current && !layersContainerRef.current.contains(event.target as Node)) {
            setOpen(false)
        }
    }

    const handleSwitchMapLayer = (event: React.ChangeEvent<HTMLInputElement>) => {
        onSwitchMapLayer?.(event.target.id as MapLayersType)
    }

    const handleSwitchMapType = (event: React.ChangeEvent<HTMLInputElement>) => {
        onSwitchMapType?.(event.target.id as MapObjectsType)
    }

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside)

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    return !open ? (
        <Button
            mode={'secondary'}
            icon={'Layers'}
            onClick={handleToggleOpen}
        />
    ) : (
        <Container
            className={styles.mapLayersContainer}
            onMouseMove={(e) => e.stopPropagation()}
            onWheelCapture={(e) => e.stopPropagation()}
        >
            <div ref={layersContainerRef}>
                <ul className={styles.mapLayersList}>
                    {Object.values(MapLayers).map((layer) => (
                        <li key={layer}>
                            <RadioButton
                                id={layer}
                                label={t(`map-layer:${layer}`)}
                                checked={currentLayer === layer}
                                onChange={handleSwitchMapLayer}
                            />
                        </li>
                    ))}
                </ul>
                <ul className={styles.mapPointsTypeList}>
                    {Object.values(MapObjects).map((type) => (
                        <li key={type}>
                            <RadioButton
                                id={type}
                                label={t(`map-type:${type}`)}
                                checked={currentType === type}
                                onChange={handleSwitchMapType}
                            />
                        </li>
                    ))}
                </ul>
                <ul className={styles.mapAdditionalList}>
                    {Object.values(MapAdditionalLayers).map((type) => (
                        <li key={type}>
                            <Checkbox
                                id={type}
                                label={t(`map-type:${type}`)}
                                checked={additionalLayers?.includes(type)}
                                onChange={() =>
                                    onSwitchAdditionalLayers?.(
                                        additionalLayers?.includes(type)
                                            ? additionalLayers.filter((layer) => layer !== type)
                                            : [...(additionalLayers || []), type]
                                    )
                                }
                            />
                        </li>
                    ))}
                </ul>
            </div>
        </Container>
    )
}

export default LayerSwitcherControl
