'use client'

import { useTranslation } from 'next-i18next'
import Link from 'next/link'
import React, { useCallback, useEffect, useMemo, useState } from 'react'

import Button from '@/ui/button'
import Input from '@/ui/input'
import Message from '@/ui/message'

import { API, isApiValidationErrors } from '@/api/api'
import { closeAuthDialog } from '@/api/applicationSlice'
import { login } from '@/api/authSlice'
import { useAppDispatch } from '@/api/store'
import { ApiTypes } from '@/api/types'

import LoginGoogleButton from '@/components/login-form/LoginGoogleButton'

import { validateEmail } from '@/functions/validators'

import styles from './styles.module.sass'

interface LoginFormProps {
    onSuccessLogin?: () => void
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccessLogin }) => {
    const { t } = useTranslation('common', {
        keyPrefix: 'components.loginForm'
    })

    const dispatch = useAppDispatch()
    const [loading, setLoading] = useState<boolean>(false)
    const [localeError, setLocaleError] = useState<string>('')
    const [formData, setFormData] = useState<ApiTypes.RequestAuthLogin>()
    const [formErrors, setFormErrors] = useState<ApiTypes.RequestAuthLogin>()

    const [authLoginPost, { isLoading, data: authData, error, isSuccess }] =
        API.useAuthPostLoginMutation()

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
            authLoginPost(formData)
        }
    }

    const handleGoogleError = () => {
        setLocaleError(t('googleError'))
    }

    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            handleLoginButton()
        }
    }

    const loadingForm = isSuccess || isLoading || loading

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
        return () => {
            dispatch(closeAuthDialog())
            setLocaleError('')
        }
    }, [])

    return (
        <div className={styles.loginForm}>
            <LoginGoogleButton
                loading={loadingForm}
                onErrorLogin={handleGoogleError}
                onLoading={setLoading}
            />

            <hr />

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
