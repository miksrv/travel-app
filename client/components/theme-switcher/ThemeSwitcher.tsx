import React from 'react'
import { useTheme } from 'next-themes'
import { Button } from 'simple-react-ui-kit'

import styles from './styles.module.sass'

import useClientOnly from '@/functions/hooks/useClientOnly'

const ThemeSwitcher: React.FC = () => {
    const isClient = useClientOnly()
    const { theme, setTheme } = useTheme()

    const handleToggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark')
    }

    return isClient ? (
        <Button
            className={styles.themeSwitchButton}
            icon={theme === 'dark' ? 'Sun' : 'Moon'}
            mode={'outline'}
            onClick={handleToggleTheme}
        />
    ) : null
}

export default ThemeSwitcher
