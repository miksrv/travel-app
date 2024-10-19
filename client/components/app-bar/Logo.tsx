'use client'

import React from 'react'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { cn } from 'simple-react-ui-kit'

import styles from './styles.module.sass'

const Logo: React.FC = () => {
    const { theme } = useTheme()

    return (
        <Link
            href={'/'}
            title={''}
            className={cn(styles.logo, theme === 'dark' && styles.dark)}
        />
    )
}

export default Logo
