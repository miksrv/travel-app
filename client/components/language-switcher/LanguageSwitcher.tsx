import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import React, { useEffect } from 'react'

import { setLocale } from '@/api/applicationSlice'
import { useAppDispatch } from '@/api/store'
import { ApiTypes } from '@/api/types'

import styles from './styles.module.sass'

const LanguageSwitcher: React.FC = () => {
    const { i18n } = useTranslation()
    const router = useRouter()
    const dispatch = useAppDispatch()
    const { language: currentLanguage } = i18n
    const { pathname, asPath, query } = router

    const changeLanguage = async (locale: ApiTypes.LocaleType) => {
        if (locale === currentLanguage) {
            return
        }

        dispatch(setLocale(locale))
        await i18n.changeLanguage(locale)
        await router.push({ pathname, query }, asPath, { locale })
    }

    useEffect(() => {
        dispatch(setLocale(currentLanguage as ApiTypes.LocaleType))
    }, [])

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
