import {
    ArrowBackIosOutlined,
    ArrowForwardIosOutlined
} from '@mui/icons-material'
import React, { PropsWithChildren } from 'react'

import styles from './styles.module.sass'

type PropType = PropsWithChildren<
    React.DetailedHTMLProps<
        React.ButtonHTMLAttributes<HTMLButtonElement>,
        HTMLButtonElement
    >
>

export const PrevButton: React.FC<PropType> = (props) => {
    const { children, ...restProps } = props

    return (
        <button
            className={styles.arrowButtonLeft}
            type={'button'}
            {...restProps}
        >
            <ArrowBackIosOutlined />
            {children}
        </button>
    )
}

export const NextButton: React.FC<PropType> = (props) => {
    const { children, ...restProps } = props

    return (
        <button
            className={styles.arrowButtonRight}
            type={'button'}
            {...restProps}
        >
            <ArrowForwardIosOutlined />
            {children}
        </button>
    )
}
