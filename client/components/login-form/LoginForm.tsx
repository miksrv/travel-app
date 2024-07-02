'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'

import styles from './styles.module.sass'

import { API, isApiValidationErrors } from '@/api/api'
import { closeAuthDialog } from '@/api/applicationSlice'
import { login } from '@/api/authSlice'
import { useAppDispatch } from '@/api/store'
import { ApiTypes } from '@/api/types'
import { LOCAL_STORAGE } from '@/functions/constants'
import useLocalStorage from '@/functions/hooks/useLocalStorage'
import { validateEmail } from '@/functions/validators'
import googleLogo from '@/public/images/google-logo.png'
import vkLogo from '@/public/images/vk-logo.png'
import yandexLogo from '@/public/images/yandex-logo.png'
import Button from '@/ui/button'
import Input from '@/ui/input'
import Message from '@/ui/message'

interface LoginFormProps {
    onClickRegistration?: () => void
    onSuccessLogin?: () => void
}

const LoginForm: React.FC<LoginFormProps> = ({ onClickRegistration, onSuccessLogin }) => {
    const dispatch = useAppDispatch()
    const router = useRouter()
    const { t } = useTranslation()

    const [, setReturnPath] = useLocalStorage<string>(LOCAL_STORAGE.RETURN_PATH)

    const [localeError, setLocaleError] = useState<string>('')
    const [formData, setFormData] = useState<ApiTypes.RequestAuthLogin>()
    const [formErrors, setFormErrors] = useState<ApiTypes.RequestAuthLogin>()

    const [authLoginNative, { data: authData, isLoading: nativeLoading, isSuccess: nativeSuccess, error }] =
        API.useAuthPostLoginMutation()

    const [authLoginService, { data: serviceData, isLoading: serviceLoading, isSuccess: serviceSuccess }] =
        API.useAuthLoginServiceMutation()

    const validationErrors = useMemo(
        () => (isApiValidationErrors<ApiTypes.RequestAuthRegistration>(error) ? error.messages : undefined),
        [error]
    )

    const validateForm = useCallback(() => {
        const errors: ApiTypes.RequestAuthLogin = {}

        if (!validateEmail(formData?.email)) {
            errors.email = t('error-incorrect-email')
        }

        if (!formData?.password) {
            errors.password = t('error-require-password')
        }

        if (formData?.password && formData.password.length < 8) {
            errors.password = t('error-password-length')
        }

        setFormErrors(errors)

        return !Object.keys(errors).length
    }, [formData])

    const handleChange = ({ target: { name, value } }: React.ChangeEvent<HTMLInputElement>) => {
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

    const loadingForm = nativeLoading || nativeSuccess || serviceLoading || serviceSuccess

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
        if (serviceData?.redirect && typeof window !== 'undefined') {
            window.location.href = serviceData.redirect
        }
    }, [serviceData?.redirect])

    useEffect(() => {
        return () => {
            setLocaleError('')
        }
    }, [])

    return (
        <div className={styles.loginForm}>
            <div className={styles.loginServiceButtons}>
                <Button
                    mode={'outline'}
                    disabled={loadingForm}
                    onClick={() => handleLoginServiceButton('vk')}
                >
                    <Image
                        src={vkLogo.src}
                        width={40}
                        height={40}
                        alt={''}
                    />
                </Button>

                <Button
                    mode={'outline'}
                    disabled={loadingForm}
                    onClick={() => handleLoginServiceButton('google')}
                >
                    <Image
                        src={googleLogo.src}
                        width={40}
                        height={40}
                        alt={''}
                    />
                </Button>

                <Button
                    mode={'outline'}
                    disabled={loadingForm}
                    onClick={() => handleLoginServiceButton('yandex')}
                >
                    <Image
                        src={yandexLogo.src}
                        width={40}
                        height={40}
                        alt={''}
                    />
                </Button>
            </div>

            {localeError && (
                <Message
                    type={'negative'}
                    title={localeError}
                />
            )}

            {!!Object.values(formErrors || {}).length && (
                <Message
                    type={'negative'}
                    title={t('correct-errors-on-form')}
                    list={Object.values(formErrors || {})}
                />
            )}

            <div className={styles.formElement}>
                <Input
                    tabIndex={0}
                    autoFocus={true}
                    label={t('input:Email')}
                    name={'email'}
                    error={formErrors?.email}
                    disabled={loadingForm}
                    onKeyDown={handleKeyPress}
                    onChange={handleChange}
                />
            </div>

            <div className={styles.formElement}>
                <Input
                    label={t('input:Password')}
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
                    <Button
                        mode={'link'}
                        title={t('registration')}
                        disabled={loadingForm}
                        onClick={onClickRegistration}
                    >
                        {t('registration')}
                    </Button>
                </div>
                <Button
                    mode={'primary'}
                    disabled={loadingForm}
                    onClick={handleLoginButton}
                >
                    {t('sign-in')}
                </Button>
            </div>
        </div>
    )
}
export default LoginForm
