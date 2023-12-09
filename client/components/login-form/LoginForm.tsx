'use client'

import { Button } from '@mui/material'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import React, { useEffect, useState } from 'react'

import { API } from '@/api/api'
import { login } from '@/api/authSlice'
import { useAppDispatch } from '@/api/store'
import { ApiTypes } from '@/api/types'

import InputField from '@/components/form-controllers/input-field'

interface LoginFormProps {
    loading?: boolean
    onSuccessLogin?: () => void
    setLoading?: (loading: boolean) => void
}

const LoginForm: React.FC<LoginFormProps> = (props) => {
    const { loading, onSuccessLogin, setLoading } = props
    const dispatch = useAppDispatch()
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
        <>
            <FormControl
                variant={'standard'}
                fullWidth={true}
            >
                <InputLabel
                    shrink={true}
                    htmlFor={'email'}
                    sx={{ fontSize: '16px' }}
                >
                    {'Email адрес'}
                </InputLabel>
                <InputField
                    id={'email'}
                    name={'email'}
                    disabled={isLoading || loading}
                    onChange={handleChange}
                />
            </FormControl>
            <FormControl
                variant={'standard'}
                fullWidth={true}
                sx={{ mt: 2 }}
            >
                <InputLabel
                    shrink={true}
                    htmlFor={'password'}
                    sx={{ fontSize: '16px' }}
                >
                    {'Пароль'}
                </InputLabel>
                <InputField
                    id={'password'}
                    name={'password'}
                    type={'password'}
                    disabled={isLoading || loading}
                    onChange={handleChange}
                />
            </FormControl>

            <FormControl
                variant={'standard'}
                fullWidth={true}
                sx={{ mb: 2, mt: 2 }}
            >
                <Button
                    variant={'contained'}
                    color={'primary'}
                    disabled={isLoading || loading}
                    onClick={handleLoginButton}
                >
                    {'Войти'}
                </Button>
            </FormControl>
        </>
    )
}
export default LoginForm
