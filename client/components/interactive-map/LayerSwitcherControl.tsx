import { useTranslation } from 'next-i18next'
import React, { useEffect, useRef, useState } from 'react'

import Button from '@/ui/button'
import Container from '@/ui/container'
import RadioButton from '@/ui/radio-button'

import { MapLayers, MapLayersType } from './InteractiveMap'
import styles from './styles.module.sass'

interface LayerSwitcherControlProps {
    currentLayer?: MapLayers
    onSwitchMapLayer?: (layer: MapLayers) => void
}

const LayerSwitcherControl: React.FC<LayerSwitcherControlProps> = ({
    currentLayer,
    onSwitchMapLayer
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
        onSwitchMapLayer?.(event.target.id as MapLayers)
    }

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside)

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    return (
        <div ref={layersContainerRef}>
            {!open ? (
                <Button
                    mode={'secondary'}
                    icon={'Layers'}
                    onClick={handleToggleOpen}
                />
            ) : (
                <Container className={styles.mapLayersContainer}>
                    <ul className={styles.mapLayersList}>
                        {Object.values(MapLayersType).map((layer) => (
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
                </Container>
            )}
        </div>
    )
}

export default LayerSwitcherControl
