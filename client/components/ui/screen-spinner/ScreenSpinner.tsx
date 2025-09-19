import React, { useEffect } from 'react'
import { Spinner } from 'simple-react-ui-kit'

import styles from './styles.module.sass'

export interface ScreenSpinnerProps {
    text?: string
}

export const ScreenSpinner: React.FC<ScreenSpinnerProps> = ({ text }) => {
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
            <div className={styles.container}>
                <Spinner />
                {text && <div className={styles.text}>{text}</div>}
            </div>
        </div>
    )
}
