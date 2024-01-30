'use client'

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
    const dispatch = useAppDispatch()
    const [loading, setLoading] = useState<boolean>(false)
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
            errors.email = 'Email is invalid'
        }

        if (!formData?.password) {
            errors.password = 'Password is required'
        }

        if (formData?.password && formData?.password?.length < 8) {
            errors.password = 'The minimum password length must be 8 characters'
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
        }
    }, [])

    return (
        <div className={styles.loginForm}>
            <LoginGoogleButton
                loading={loadingForm}
                onLoading={setLoading}
            />

            <hr />

            {!!Object.values(formErrors || {})?.length && (
                <Message
                    type={'negative'}
                    title={'Исправте ошибки'}
                    list={Object.values(formErrors || {})}
                />
            )}

            <div className={styles.formElement}>
                <Input
                    label={'Email адрес'}
                    name={'email'}
                    error={formErrors?.email}
                    disabled={loadingForm}
                    onChange={handleChange}
                />
            </div>

            <div className={styles.formElement}>
                <Input
                    label={'Пароль'}
                    name={'password'}
                    type={'password'}
                    error={formErrors?.password}
                    disabled={loadingForm}
                    onChange={handleChange}
                />
            </div>

            <div className={styles.actions}>
                <div>
                    <Link
                        href={'/registration'}
                        title={'Регистрация пользователя'}
                    >
                        {'Регистрация'}
                    </Link>
                    <span className={styles.divider}>{'/'}</span>
                    <Link
                        href={'/recovery'}
                        title={'Восстановление пароля'}
                    >
                        {'Забыли пароль?'}
                    </Link>
                </div>
                <Button
                    mode={'primary'}
                    disabled={loadingForm}
                    onClick={handleLoginButton}
                >
                    {'Войти'}
                </Button>
            </div>
        </div>
    )
}
export default LoginForm
