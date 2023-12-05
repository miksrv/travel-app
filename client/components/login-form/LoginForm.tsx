'use client'

import { Button } from '@mui/material'
import FormControl from '@mui/material/FormControl'
import TextField from '@mui/material/TextField'
import React, { useEffect, useState } from 'react'

import { API } from '@/api/api'
import { login } from '@/api/authSlice'
import { useAppDispatch } from '@/api/store'
import { ApiTypes } from '@/api/types'

interface LoginFormProps {}

const LoginForm: React.FC<LoginFormProps> = () => {
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
        }
    }

    useEffect(() => {
        dispatch(login(authData))
    }, [authData])

    return (
        <>
            <FormControl variant={'standard'}>
                <TextField
                    name={'email'}
                    label={'Login'}
                    variant={'outlined'}
                    onChange={handleChange}
                />
            </FormControl>
            <FormControl variant={'standard'}>
                <TextField
                    name={'password'}
                    label={'Password'}
                    variant={'outlined'}
                    onChange={handleChange}
                />
            </FormControl>

            <Button
                variant={'contained'}
                size={'small'}
                sx={{
                    left: '10px',
                    minWidth: '26px',
                    mt: 9,
                    width: '26px'
                }}
                color={'primary'}
                onClick={handleLoginButton}
            >
                {'Войти'}
            </Button>
        </>
    )
}
export default LoginForm
