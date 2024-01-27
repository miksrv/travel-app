import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import React from 'react'

import styles from './styles.module.sass'

const LanguageSwitcher: React.FC = () => {
    const { i18n } = useTranslation()
    const router = useRouter()
    const { language: currentLanguage } = i18n
    const { pathname, asPath, query } = router

    const changeLanguage = async (locale: 'en' | 'ru') => {
        await i18n.changeLanguage(locale)
        await router.push({ pathname, query }, asPath, { locale })
    }

    return (
        <div className={styles.languageSwitcher}>
            <button
                className={currentLanguage === 'en' ? styles.active : undefined}
                onClick={() => changeLanguage('en')}
            >
                {'Eng'}
            </button>
            <button
                className={currentLanguage === 'ru' ? styles.active : undefined}
                onClick={() => changeLanguage('ru')}
            >
                {'Rus'}
            </button>
        </div>
    )
}

export default LanguageSwitcher
