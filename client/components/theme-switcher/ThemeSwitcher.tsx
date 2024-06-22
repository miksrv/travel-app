import { useTheme } from 'next-themes'
import React from 'react'

import Button from '@/ui/button'

import useClientOnly from '@/functions/hooks/useClientOnly'

import styles from './styles.module.sass'

const ThemeSwitcher: React.FC = () => {
    const isClient = useClientOnly()
    const { theme, setTheme } = useTheme()

    const handleToggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark')
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
