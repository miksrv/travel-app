import { useTranslation } from 'next-i18next'
import React, { useEffect, useRef, useState } from 'react'

import Button from '@/ui/button'
import Container from '@/ui/container'
import RadioButton from '@/ui/radio-button'

import {
    MapLayers,
    MapLayersType,
    MapObjects,
    MapObjectsType
} from './InteractiveMap'
import styles from './styles.module.sass'

interface LayerSwitcherControlProps {
    currentLayer?: MapLayersType
    currentType?: MapObjectsType
    onSwitchMapLayer?: (layer: MapLayersType) => void
    onSwitchMapType?: (type: MapObjectsType) => void
}

const LayerSwitcherControl: React.FC<LayerSwitcherControlProps> = ({
    currentLayer,
    currentType,
    onSwitchMapLayer,
    onSwitchMapType
}) => {
    const layersContainerRef = useRef<HTMLDivElement>(null)
    const [open, setOpen] = useState<boolean>(false)

    const { t } = useTranslation('common', {
        keyPrefix: 'components.interactiveMap.layerSwitcher'
    })

    const handleToggleOpen = () => {
        setOpen(!open)
    }

    const handleClickOutside = (event: MouseEvent) => {
        if (
            layersContainerRef.current &&
            !layersContainerRef.current.contains(event.target as Node)
        ) {
            setOpen(false)
        }
    }

    const handleSwitchMapLayer = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setOpen(false)
        onSwitchMapLayer?.(event.target.id as MapLayersType)
    }

    const handleSwitchMapType = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setOpen(false)
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
                                label={t(layer)}
                                name={'layerType'}
                                checked={currentLayer === layer}
                                onChange={handleSwitchMapLayer}
                                onClick={() => setOpen(false)}
                            />
                        </li>
                    ))}
                </ul>
                <ul className={styles.mapPointsTypeList}>
                    {Object.values(MapObjects).map((type) => (
                        <li key={type}>
                            <RadioButton
                                id={type}
                                label={t(type)}
                                name={'layerType'}
                                checked={currentType === type}
                                onChange={handleSwitchMapType}
                                onClick={() => setOpen(false)}
                            />
                        </li>
                    ))}
                </ul>
            </div>
        </Container>
    )
}

export default LayerSwitcherControl
