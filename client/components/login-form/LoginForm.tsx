'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { Button, Input, Message } from 'simple-react-ui-kit'

import styles from './styles.module.sass'

import { API, ApiType, isApiValidationErrors, useAppDispatch } from '@/api'
import { closeAuthDialog } from '@/api/applicationSlice'
import { login } from '@/api/authSlice'
import { LOCAL_STORAGE } from '@/functions/constants'
import useLocalStorage from '@/functions/hooks/useLocalStorage'
import { validateEmail } from '@/functions/validators'
import googleLogo from '@/public/images/google-logo.png'
import vkLogo from '@/public/images/vk-logo.png'
import yandexLogo from '@/public/images/yandex-logo.png'

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
    const [formData, setFormData] = useState<ApiType.Auth.PostLoginNativeRequest>()
    const [formErrors, setFormErrors] = useState<ApiType.Auth.PostLoginNativeRequest>()

    const [authLoginNative, { data: authData, isLoading: nativeLoading, isSuccess: nativeSuccess, error }] =
        API.useAuthPostLoginMutation()

    const [authLoginService, { data: serviceData, isLoading: serviceLoading, isSuccess: serviceSuccess }] =
        API.useAuthLoginServiceMutation()

    const validationErrors = useMemo(
        () => (isApiValidationErrors<ApiType.Auth.PostRegistrationRequest>(error) ? error.messages : undefined),
        [error]
    )

    const validateForm = useCallback(() => {
        const errors: ApiType.Auth.PostLoginNativeRequest = {}

        if (!validateEmail(formData?.email)) {
            errors.email = t('error_email-incorrect')
        }

        if (!formData?.password) {
            errors.password = t('error_password-required')
        }

        if (formData?.password && formData.password.length < 8) {
            errors.password = t('error_password-length')
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

    const handleLoginServiceButton = (service: ApiType.AuthService) => {
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
                    type={'error'}
                    title={localeError}
                />
            )}

            {!!Object.values(formErrors || {}).length && (
                <Message
                    type={'error'}
                    title={t('correct-errors-on-form')}
                >
                    <ul className={'errorMessageList'}>
                        {Object.values(formErrors || {}).map((item) =>
                            item.length ? <li key={`item${item}`}>{item}</li> : ''
                        )}
                    </ul>
                </Message>
            )}

            <div className={styles.formElement}>
                <Input
                    tabIndex={0}
                    autoFocus={true}
                    label={t('input_email')}
                    name={'email'}
                    error={formErrors?.email}
                    disabled={loadingForm}
                    onKeyDown={handleKeyPress}
                    onChange={handleChange}
                />
            </div>

            <div className={styles.formElement}>
                <Input
                    label={t('input_password')}
                    name={'password'}
                    type={'password'}
                    error={formErrors?.password}
                    disabled={loadingForm}
                    onKeyDown={handleKeyPress}
                    onChange={handleChange}
                />
            </div>

            <div className={styles.actions}>
                <Button
                    mode={'link'}
                    title={t('registration')}
                    disabled={loadingForm}
                    onClick={onClickRegistration}
                >
                    {t('registration')}
                </Button>
                <Button
                    mode={'primary'}
                    loading={loadingForm}
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
