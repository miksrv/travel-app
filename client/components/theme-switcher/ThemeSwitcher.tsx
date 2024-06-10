import { useTranslation } from 'next-i18next'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'

import { setLocale } from '@/api/applicationSlice'
import { useAppDispatch } from '@/api/store'
import { ApiTypes } from '@/api/types'

import { LOCAL_STORAGE } from '@/functions/constants'
import useLocalStorage from '@/functions/hooks/useLocalStorage'

import styles from './styles.module.sass'

const ThemeSwitcher: React.FC = () => {
    const [isDarkTheme, setIsDarkTheme] = useState(false)

    const toggleTheme = () => {
        setIsDarkTheme(!isDarkTheme)
    }

    return (
        <div>
            <button onClick={toggleTheme}>Toggle Theme</button>
        </div>
    )
}

export default ThemeSwitcher
