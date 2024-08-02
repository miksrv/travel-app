'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Point } from 'leaflet'
import Link from 'next/link'
import { useTranslation } from 'next-i18next'

import styles from './styles.module.sass'

import { Notify } from '@/api/notificationSlice'
import { useAppDispatch, useAppSelector } from '@/api/store'
import { ApiTypes } from '@/api/types'
import { MapPositionType } from '@/components/interactive-map/InteractiveMap'
import { Google, Wikimapia, Yandex } from '@/components/map-links/MapLinks'
import { LOCAL_STORAGE } from '@/functions/constants'
import { convertDMS } from '@/functions/coordinates'
import { round } from '@/functions/helpers'
import useLocalStorage from '@/functions/hooks/useLocalStorage'
import Button from '@/ui/button'
import Container from '@/ui/container'
import { useLeafletContext } from '@react-leaflet/core'

const ContextMenu: React.FC = () => {
    const dispatch = useAppDispatch()
    const { t } = useTranslation()

    const isAuth = useAppSelector((state) => state.auth.isAuth)

    const [, setCoordinates] = useLocalStorage<MapPositionType>(LOCAL_STORAGE.MAP_CENTER)

    const getContext = useLeafletContext()
    const mapContext = useRef<ReturnType<typeof useLeafletContext>>(getContext)
    const mapSize = useRef<Point>()
    const menuWrapRef = useRef<HTMLDivElement>(null)

    const [pointCords, setPointCords] = useState<ApiTypes.LatLonCoordinate>()
    const [isShowMenu, setIsShowMenu] = useState<boolean>(false)

    const [point, setPoint] = useState<{
        x: number
        y: number
    }>({
        x: 0,
        y: 0
    })

    const handleCopyCoordinates = () => {
        navigator.clipboard.writeText(`${pointCords?.lat} ${pointCords?.lon}`)
        setIsShowMenu(false)

        dispatch(
            Notify({
                id: 'copyCoordinates',
                title: '',
                message: t('coordinates-copied'),
                type: 'success'
            })
        )
    }

    useEffect(() => {
        if (mapContext.current.map) {
            mapSize.current = mapContext.current.map.getSize()

            mapContext.current.map.on('click dragstart zoom', () => {
                setIsShowMenu(false)
            })

            mapContext.current.map.on(
                'resize',
                (event) => {
                    mapSize.current = event.newSize
                },
                []
            )

            const menuPointYisOverFlow = (pointY: number, menuWrapHeight: number, mapSize: Point) => {
                if (pointY > mapSize.y - menuWrapHeight) {
                    return pointY - menuWrapHeight
                }
                return pointY
            }

            mapContext.current.map.on('contextmenu', (event) => {
                const pointRightClick: Point = event.containerPoint
                const menuWrapWidth: number = menuWrapRef.current ? Number(menuWrapRef.current.offsetWidth) : 0
                const menuWrapHeight: number = menuWrapRef.current ? Number(menuWrapRef.current.offsetHeight) : 0

                setPointCords({
                    lat: round(event.latlng.lat, 6) || 0,
                    lon: round(event.latlng.lng, 6) || 0
                })

                if (mapSize.current && pointRightClick.x > mapSize.current.x - menuWrapWidth) {
                    const calculationX =
                        pointRightClick.x === mapSize.current.x
                            ? pointRightClick.x - menuWrapWidth - 20
                            : pointRightClick.x - menuWrapWidth

                    setPoint({
                        x: calculationX,
                        y: menuPointYisOverFlow(pointRightClick.y, menuWrapHeight, mapSize.current)
                    })
                } else {
                    if (mapSize.current) {
                        setPoint({
                            x: pointRightClick.x,
                            y: menuPointYisOverFlow(pointRightClick.y, menuWrapHeight, mapSize.current)
                        })
                    }
                }

                setIsShowMenu(true)
            })
        }
    }, [])

    if (!getContext) {
        return null
    }

    return (
        <div
            ref={menuWrapRef}
            style={{
                display: isShowMenu ? 'block' : 'none',
                left: `${point.x}px`,
                position: 'absolute',
                top: `${point.y}px`,
                zIndex: 400
            }}
        >
            <Container className={styles.contextMenu}>
                <ul className={styles.menuList}>
                    <li className={styles.divider}>
                        <Button
                            mode={'link'}
                            size={'small'}
                            title={t('copy-to-clipboard')}
                            onClick={handleCopyCoordinates}
                        >
                            {convertDMS(pointCords?.lat, pointCords?.lon)}
                        </Button>
                    </li>
                    {isAuth && (
                        <li className={styles.divider}>
                            <Link
                                href={'/places/create'}
                                title={t('create-geotag')}
                                onClick={() => {
                                    setCoordinates({
                                        lat: pointCords?.lat ?? 0,
                                        lon: pointCords?.lon ?? 0,
                                        zoom: 18
                                    })
                                }}
                            >
                                {t('create-geotag')}
                            </Link>
                        </li>
                    )}
                    <li>
                        <Yandex
                            showTitle={true}
                            lat={pointCords?.lat ?? 0}
                            lon={pointCords?.lon ?? 0}
                            zoom={mapContext.current.map.getZoom()}
                        />
                    </li>
                    <li>
                        <Google
                            showTitle={true}
                            lat={pointCords?.lat ?? 0}
                            lon={pointCords?.lon ?? 0}
                            zoom={mapContext.current.map.getZoom()}
                        />
                    </li>
                    <li>
                        <Wikimapia
                            showTitle={true}
                            lat={pointCords?.lat ?? 0}
                            lon={pointCords?.lon ?? 0}
                            zoom={mapContext.current.map.getZoom()}
                        />
                    </li>
                </ul>
            </Container>
        </div>
    )
}

export default ContextMenu
