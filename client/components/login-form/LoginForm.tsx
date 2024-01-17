'use client'

import FormControl from '@mui/material/FormControl'
import React, { useEffect, useState } from 'react'

import Button from '@/ui/button'
import Input from '@/ui/input'

import { API } from '@/api/api'
import { login } from '@/api/authSlice'
import { useAppDispatch } from '@/api/store'
import { ApiTypes } from '@/api/types'

import LoginGoogleButton from '@/components/login-form/LoginGoogleButton'

import styles from './styles.module.sass'

interface LoginFormProps {
    onSuccessLogin?: () => void
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccessLogin }) => {
    const dispatch = useAppDispatch()
    const [loading, setLoading] = useState<boolean>(false)
    const [formData, setFormState] = useState<ApiTypes.RequestAuthLogin>()
    const [authLoginPost, { isLoading, data: authData }] =
        API.useAuthPostLoginMutation()

    const handleChange = ({
        target: { name, value }
    }: React.ChangeEvent<HTMLInputElement>) => {
        setFormState((prev) => ({ ...prev, [name]: value }))
    }

    const handleLoginButton = () => {
        if (formData) {
            authLoginPost(formData)
            setLoading?.(true)
        }
    }

    useEffect(() => {
        dispatch(login(authData))

        if (authData?.auth) {
            onSuccessLogin?.()
        }
    }, [authData])

    useEffect(() => {
        setLoading?.(isLoading)
    }, [isLoading])

    return (
        <div className={styles.loginForm}>
            <LoginGoogleButton
                loading={loading}
                onLoading={setLoading}
            />

            <hr />

            <div className={styles.formElement}>
                <Input
                    label={'Email адрес'}
                    name={'email'}
                    disabled={isLoading || loading}
                    onChange={handleChange}
                />
            </div>

            <div className={styles.formElement}>
                <Input
                    label={'Пароль'}
                    name={'password'}
                    type={'password'}
                    disabled={isLoading || loading}
                    onChange={handleChange}
                />
            </div>

            <Button
                stretched={true}
                mode={'primary'}
                disabled={isLoading || loading}
                onClick={handleLoginButton}
            >
                {'Войти'}
            </Button>
        </div>
    )
}
export default LoginForm
