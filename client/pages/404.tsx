import React from 'react'
import { Button } from 'simple-react-ui-kit'

import { NextPage } from 'next'
import Image from 'next/image'
import { NextSeo } from 'next-seo'

import logo from '@/public/images/geometki.svg'

const NotFound: NextPage<object> = () => (
    <div className={'page404'}>
        <NextSeo
            nofollow={true}
            noindex={true}
        />
        <div className={'container'}>
            <Image
                src={logo}
                alt={''}
                width={58}
                height={58}
            />
            <h1>{'You have gone off the map'}</h1>
            <Button
                mode={'primary'}
                size={'medium'}
                link={'/'}
                label={'Go back to the main page'}
            />
        </div>
    </div>
)

export default NotFound
