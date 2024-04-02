'use client'

import { useLeafletContext } from '@react-leaflet/core'
import { Point } from 'leaflet'
import { useTranslation } from 'next-i18next'
import Image from 'next/image'
import Link from 'next/link'
import React, { useEffect, useRef, useState } from 'react'

import Button from '@/ui/button'
import Container from '@/ui/container'

import { ApiTypes } from '@/api/types'

import { convertDMS } from '@/functions/coordinates'
import { round } from '@/functions/helpers'

import googleLogo from '@/public/images/google-logo.png'
import wikimapiaLogo from '@/public/images/wikimapia-logo.png'
import yandexLogo from '@/public/images/yandex-logo.png'

import styles from './styles.module.sass'

const ContextMenu: React.FC = () => {
    const { t, i18n } = useTranslation('common', {
        keyPrefix: 'components.interactiveMap.contextMenu'
    })

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
        navigator?.clipboard?.writeText(`${pointCords?.lat} ${pointCords?.lon}`)
        setIsShowMenu(false)
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

            const menuPointYisOverFlow = (
                pointY: number,
                menuWrapHeight: number,
                mapSize: Point
            ) => {
                if (pointY > mapSize.y - menuWrapHeight)
                    return pointY - menuWrapHeight
                else return pointY
            }

            mapContext.current.map.on('contextmenu', (event) => {
                const pointRightClick: Point = event.containerPoint
                const menuWrapWidth: number = menuWrapRef.current
                    ? Number(menuWrapRef.current.offsetWidth)
                    : 0
                const menuWrapHeight: number = menuWrapRef.current
                    ? Number(menuWrapRef.current.offsetHeight)
                    : 0

                setPointCords({
                    lat: round(event.latlng.lat, 6) || 0,
                    lon: round(event.latlng.lng, 6) || 0
                })

                if (
                    mapSize.current &&
                    pointRightClick.x > mapSize.current.x - menuWrapWidth
                ) {
                    const calculationX =
                        pointRightClick.x === mapSize.current.x
                            ? pointRightClick.x - menuWrapWidth - 20
                            : pointRightClick.x - menuWrapWidth

                    setPoint({
                        x: calculationX,
                        y: menuPointYisOverFlow(
                            pointRightClick.y,
                            menuWrapHeight,
                            mapSize.current
                        )
                    })
                } else {
                    mapSize.current &&
                        setPoint({
                            x: pointRightClick.x,
                            y: menuPointYisOverFlow(
                                pointRightClick.y,
                                menuWrapHeight,
                                mapSize.current
                            )
                        })
                }

                setIsShowMenu(true)
            })
        }
    }, [])

    if (!getContext) return null

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
                            size={'s'}
                            title={t('copyToClipboard')}
                            onClick={handleCopyCoordinates}
                        >
                            {convertDMS(pointCords?.lat!, pointCords?.lon!)}
                        </Button>
                    </li>
                    <li>
                        <Link
                            href={`https://yandex.ru/maps/?pt=${
                                pointCords?.lon
                            },${
                                pointCords?.lat
                            }&spn=0.1,0.1&l=sat,skl&z=${mapContext.current.map?.getZoom()}`}
                            title={''}
                            target={'_blank'}
                        >
                            <Image
                                src={yandexLogo.src}
                                width={16}
                                height={16}
                                alt={''}
                                style={{ marginRight: '1px' }}
                            />{' '}
                            {t('openYandex')}
                        </Link>
                    </li>
                    <li>
                        <Link
                            href={`https://maps.google.com/maps?ll=${
                                pointCords?.lat
                            },${pointCords?.lon}&q=${pointCords?.lat},${
                                pointCords?.lon
                            }&z=${mapContext.current.map?.getZoom()}&spn=0.1,0.1&t=h&hl=${
                                i18n.language
                            }`}
                            title={''}
                            target={'_blank'}
                        >
                            <Image
                                src={googleLogo.src}
                                width={16}
                                height={16}
                                alt={''}
                            />
                            {t('openGoogle')}
                        </Link>
                    </li>
                    <li>
                        <Link
                            href={`https://wikimapia.org/#lang=${
                                i18n.language
                            }&lat=${pointCords?.lat}&lon=${
                                pointCords?.lon
                            }&z=${mapContext.current.map?.getZoom()}&m=w`}
                            title={''}
                            target={'_blank'}
                        >
                            <Image
                                src={wikimapiaLogo.src}
                                width={13}
                                height={13}
                                style={{
                                    marginLeft: '2px',
                                    marginRight: '6px'
                                }}
                                alt={''}
                            />
                            {t('openWikimapia')}
                        </Link>
                    </li>
                </ul>
            </Container>
        </div>
    )
}

export default ContextMenu
