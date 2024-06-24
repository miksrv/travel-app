import React from 'react'
import { NextPage } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { NextSeo } from 'next-seo'

import logo from '@/public/images/geometki.svg'

interface NotFoundProps {}

const NotFound: NextPage<NotFoundProps> = () => (
    <div className={'page404'}>
        <NextSeo
            nofollow={true}
            noindex={true}
        />
        <Image
            src={logo}
            alt={''}
            width={58}
            height={58}
        />
        <h2>{'You have gone off the map'}</h2>
        <Link
            href={'/'}
            title={''}
        >
            {'Go back to the main page'}
        </Link>
    </div>
)

export default NotFound
