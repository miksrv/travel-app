import { StaticImageData } from 'next/image'

import { Place } from '@/api/types'
import abandoned from '@/public/images/poi/abandoned.png'
import animals from '@/public/images/poi/animals.png'
import archeology from '@/public/images/poi/archeology.png'
import bridge from '@/public/images/poi/bridge.png'
import camping from '@/public/images/poi/camping.png'
import castle from '@/public/images/poi/castle.png'
import cave from '@/public/images/poi/cave.png'
import construction from '@/public/images/poi/construction.png'
import death from '@/public/images/poi/death.png'
import manor from '@/public/images/poi/manor.png'
import memorial from '@/public/images/poi/memorial.png'
import military from '@/public/images/poi/military.png'
import mine from '@/public/images/poi/mine.png'
import monument from '@/public/images/poi/monument.png'
import mountain from '@/public/images/poi/mountain.png'
import museum from '@/public/images/poi/museum.png'
import nature from '@/public/images/poi/nature.png'
import radiation from '@/public/images/poi/radiation.png'
import religious from '@/public/images/poi/religious.png'
import spring from '@/public/images/poi/spring.png'
import transport from '@/public/images/poi/transport.png'
import water from '@/public/images/poi/water.png'
import waterfall from '@/public/images/poi/waterfall.png'

export const categoryImage = (category?: Place.Categories): StaticImageData => {
    switch (category) {
        case Place.Categories.animals:
            return animals

        case Place.Categories.death:
            return death

        case Place.Categories.radiation:
            return radiation

        case Place.Categories.bridge:
            return bridge

        case Place.Categories.military:
            return military

        case Place.Categories.transport:
            return transport

        case Place.Categories.abandoned:
            return abandoned

        case Place.Categories.mine:
            return mine

        case Place.Categories.construction:
            return construction

        case Place.Categories.memorial:
            return memorial

        case Place.Categories.monument:
            return monument

        case Place.Categories.museum:
            return museum

        case Place.Categories.castle:
            return castle

        case Place.Categories.manor:
            return manor

        case Place.Categories.religious:
            return religious

        case Place.Categories.archeology:
            return archeology

        case Place.Categories.cave:
            return cave

        case Place.Categories.waterfall:
            return waterfall

        case Place.Categories.spring:
            return spring

        case Place.Categories.nature:
            return nature

        case Place.Categories.water:
            return water

        case Place.Categories.mountain:
            return mountain

        case Place.Categories.camping:
            return camping

        default:
            return nature
    }
}
