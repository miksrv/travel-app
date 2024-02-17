'use client'

import { useTranslation } from 'next-i18next'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useCallback, useEffect, useMemo, useState } from 'react'

import Button from '@/ui/button'
import Input from '@/ui/input'
import Message from '@/ui/message'

import { API, isApiValidationErrors } from '@/api/api'
import { closeAuthDialog } from '@/api/applicationSlice'
import { login } from '@/api/authSlice'
import { useAppDispatch } from '@/api/store'
import { ApiTypes } from '@/api/types'

import { LOCAL_STORGE } from '@/functions/constants'
import useLocalStorage from '@/functions/hooks/useLocalStorage'
import { validateEmail } from '@/functions/validators'

import googleLogo from '@/public/images/google-logo.png'
import yandexLogo from '@/public/images/yandex-logo.png'

import styles from './styles.module.sass'

interface LoginFormProps {
    onSuccessLogin?: () => void
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccessLogin }) => {
    const { t } = useTranslation('common', {
        keyPrefix: 'components.loginForm'
    })

    const dispatch = useAppDispatch()
    const router = useRouter()

    const [, setReturnPath] = useLocalStorage<string>(LOCAL_STORGE.RETURN_PATH)

    const [localeError, setLocaleError] = useState<string>('')
    const [formData, setFormData] = useState<ApiTypes.RequestAuthLogin>()
    const [formErrors, setFormErrors] = useState<ApiTypes.RequestAuthLogin>()

    const [
        authLoginNative,
        {
            data: authData,
            isLoading: nativeLoading,
            isSuccess: nativeSuccess,
            error
        }
    ] = API.useAuthPostLoginMutation()

    const [
        authLoginService,
        {
            data: serviceData,
            isLoading: serviceLoading,
            isSuccess: serviceSuccess,
            isError: serviceError
        }
    ] = API.useAuthLoginServiceMutation()

    const validationErrors = useMemo(
        () =>
            isApiValidationErrors<ApiTypes.RequestAuthRegistration>(error)
                ? error?.messages
                : undefined,
        [error]
    )

    const validateForm = useCallback(() => {
        const errors: ApiTypes.RequestAuthLogin = {}

        if (!validateEmail(formData?.email)) {
            errors.email = t('errorEmail')
        }

        if (!formData?.password) {
            errors.password = t('errorPassword')
        }

        if (formData?.password && formData?.password?.length < 8) {
            errors.password = t('errorPasswordLength')
        }

        setFormErrors(errors)

        return !Object.keys(errors).length
    }, [formData])

    const handleChange = ({
        target: { name, value }
    }: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [name]: value })
    }

    const handleLoginButton = () => {
        if (validateForm() && formData) {
            authLoginNative(formData)
        }
    }

    const handleLoginServiceButton = (service: ApiTypes.AuthServiceType) => {
        setReturnPath(router.asPath)
        authLoginService({ service })
    }

    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            handleLoginButton()
        }
    }

    const loadingForm =
        nativeLoading || nativeSuccess || serviceLoading || serviceSuccess

    useEffect(() => {
        setFormErrors(validationErrors)
    }, [error])

    useEffect(() => {
        dispatch(login(authData))

        if (authData?.auth) {
            onSuccessLogin?.()
            dispatch(closeAuthDialog())
        }
    }, [authData])

    useEffect(() => {
        if (serviceData?.redirect) {
            window.location.href = serviceData.redirect
        }
    }, [serviceData?.redirect])

    useEffect(() => {
        if (serviceError) {
            setLocaleError(t('googleError'))
        }
    }, [serviceError])

    useEffect(() => {
        return () => {
            dispatch(closeAuthDialog())
            setLocaleError('')
        }
    }, [])

    return (
        <div className={styles.loginForm}>
            <div className={styles.loginServiceButtons}>
                <Button
                    stretched={true}
                    size={'m'}
                    mode={'secondary'}
                    disabled={loadingForm}
                    onClick={() => handleLoginServiceButton('google')}
                >
                    <Image
                        src={googleLogo.src}
                        style={{}}
                        width={20}
                        height={20}
                        alt={''}
                    />
                    {t('loginGoogle')}
                </Button>

                <Button
                    stretched={true}
                    size={'m'}
                    mode={'secondary'}
                    disabled={loadingForm}
                    onClick={() => handleLoginServiceButton('yandex')}
                >
                    <Image
                        src={yandexLogo.src}
                        width={20}
                        height={20}
                        alt={''}
                    />
                    {t('loginYandex')}
                </Button>
            </div>

            {localeError && (
                <Message
                    type={'negative'}
                    title={localeError}
                />
            )}

            {!!Object.values(formErrors || {})?.length && (
                <Message
                    type={'negative'}
                    title={t('errorsMessageTitle')}
                    list={Object.values(formErrors || {})}
                />
            )}

            <div className={styles.formElement}>
                <Input
                    label={t('inputEmail')}
                    name={'email'}
                    error={formErrors?.email}
                    disabled={loadingForm}
                    onKeyDown={handleKeyPress}
                    onChange={handleChange}
                />
            </div>

            <div className={styles.formElement}>
                <Input
                    label={t('inputPassword')}
                    name={'password'}
                    type={'password'}
                    error={formErrors?.password}
                    disabled={loadingForm}
                    onKeyDown={handleKeyPress}
                    onChange={handleChange}
                />
            </div>

            <div className={styles.actions}>
                <div>
                    <Link
                        href={'/registration'}
                        title={t('linkRegistrationTitle')}
                    >
                        {t('linkRegistrationCaption')}
                    </Link>
                    <span className={styles.divider}>{'/'}</span>
                    <Link
                        href={'/recovery'}
                        title={t('linkRecoveryTitle')}
                    >
                        {t('linkRecoveryCaption')}
                    </Link>
                </div>
                <Button
                    mode={'primary'}
                    disabled={loadingForm}
                    onClick={handleLoginButton}
                >
                    {t('buttonLogin')}
                </Button>
            </div>
        </div>
    )
}
export default LoginForm
