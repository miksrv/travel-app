import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import React from 'react'

const LanguageSwitcher: React.FC = () => {
    const { i18n } = useTranslation()
    const { language: currentLanguage } = i18n
    const router = useRouter()
    const { pathname, asPath, query } = router

    const changeLanguage = async (locale: 'en' | 'ru') => {
        await i18n.changeLanguage(locale)
        await router.push({ pathname, query }, asPath, { locale })
    }

    return (
        <div>
            <button onClick={() => changeLanguage('en')}>
                {currentLanguage === 'en' && '+'} {'English'}
            </button>
            <button onClick={() => changeLanguage('ru')}>
                {currentLanguage === 'ru' && '+'}
                {'Russian'}
            </button>
        </div>
    )
}

export default LanguageSwitcher
