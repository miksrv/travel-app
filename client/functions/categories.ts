import { StaticImageData } from 'next/image'

import { Place } from '@/api/types'

import abandoned from '@/public/poi/abandoned.png'
import archeology from '@/public/poi/archeology.png'
import battlefield from '@/public/poi/battlefield.png'
import camping from '@/public/poi/camping.png'
import castle from '@/public/poi/castle.png'
import cave from '@/public/poi/cave.png'
import construction from '@/public/poi/construction.png'
import factory from '@/public/poi/factory.png'
import fort from '@/public/poi/fort.png'
import manor from '@/public/poi/manor.png'
import memorial from '@/public/poi/memorial.png'
import mine from '@/public/poi/mine.png'
import monument from '@/public/poi/monument.png'
import mountain from '@/public/poi/mountain.png'
import museum from '@/public/poi/museum.png'
import nature from '@/public/poi/nature.png'
import religious from '@/public/poi/religious.png'
import spring from '@/public/poi/spring.png'
import transport from '@/public/poi/transport.png'
import water from '@/public/poi/water.png'
import waterfall from '@/public/poi/waterfall.png'

export const categoryImage = (category?: Place.Categories): StaticImageData => {
    switch (category) {
        case Place.Categories.battlefield:
            return battlefield

        case Place.Categories.fort:
            return fort

        case Place.Categories.transport:
            return transport

        case Place.Categories.abandoned:
            return abandoned

        case Place.Categories.mine:
            return mine

        case Place.Categories.factory:
            return factory

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
            return battlefield
    }
}
