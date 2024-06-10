import React from 'react'

import Button from '@/ui/button'

import { toggleTheme } from '@/api/applicationSlice'
import { useAppDispatch, useAppSelector } from '@/api/store'

import useClientOnly from '@/functions/hooks/useClientOnly'

import styles from './styles.module.sass'

const ThemeSwitcher: React.FC = () => {
    const dispatch = useAppDispatch()
    const isClient = useClientOnly()
    const theme = useAppSelector((state) => state.application.theme)

    const handleToggleTheme = () => {
        dispatch(toggleTheme(theme === 'dark' ? 'light' : 'dark'))
    }

    return isClient ? (
        <Button
            className={styles.themeSwitchButton}
            icon={theme === 'dark' ? 'Light' : 'Dark'}
            mode={'outline'}
            onClick={handleToggleTheme}
        />
    ) : null
}

export default ThemeSwitcher
