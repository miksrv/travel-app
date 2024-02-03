'use client'

import React, { useEffect } from 'react'

import Spinner from '@/ui/spinner'

import styles from './styles.module.sass'

interface ScreenSpinnerProps {}

const ScreenSpinner: React.FC<ScreenSpinnerProps> = () => {
    useEffect(() => {
        const globalDiv = document.createElement('div')

        globalDiv.className = styles.overlay

        document.body.appendChild(globalDiv)

        return () => {
            document.body.removeChild(globalDiv)
        }
    }, [])

    return (
        <div className={styles.screenSpinner}>
            <Spinner />
        </div>
    )
}

export default ScreenSpinner
