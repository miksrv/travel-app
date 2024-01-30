'use client'

import React, { useCallback, useEffect, useState } from 'react'

import Button from '@/ui/button'
import Input from '@/ui/input'
import Message from '@/ui/message'

import { ApiTypes } from '@/api/types'

import { validateEmail } from '@/functions/validators'

import styles from './styles.module.sass'

type FormDataType = ApiTypes.RequestAuthRegistration & {
    repeat_password?: string
}

interface RegistrationFormProps {
    loading?: boolean
    errors?: ApiTypes.RequestAuthRegistration
    onSubmit?: (formData?: ApiTypes.RequestAuthRegistration) => void
    onCancel?: () => void
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({
    loading,
    errors,
    onSubmit,
    onCancel
}) => {
    const [formData, setFormData] = useState<FormDataType>()
    const [formErrors, setFormErrors] = useState<FormDataType>()

    const validateForm = useCallback(() => {
        const errors: FormDataType = {}

        if (!formData?.name) {
            errors.name = 'Name is required'
        }

        if (!validateEmail(formData?.email)) {
            errors.email = 'Email is invalid'
        }

        if (!formData?.password) {
            errors.password = 'Password is required'
        }

        if (formData?.password && formData?.password?.length < 8) {
            errors.password = 'The minimum password length must be 8 characters'
        }

        if (
            !formData?.repeat_password ||
            formData?.repeat_password !== formData?.password
        ) {
            errors.repeat_password = 'Password mismatch'
        }

        setFormErrors(errors)

        return !Object.keys(errors).length
    }, [formData])

    const handleChange = ({
        target: { name, value }
    }: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [name]: value })
    }

    const handleSubmit = () => {
        if (validateForm()) {
            onSubmit?.(formData)
        }
    }

    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            handleSubmit()
        }
    }

    useEffect(() => {
        setFormErrors(errors)
    }, [errors])

    return (
        <div className={styles.registrationForm}>
            {!!Object.values(formErrors || {})?.length && (
                <Message
                    type={'negative'}
                    title={'Исправте ошибки'}
                    list={Object.values(formErrors || {})}
                />
            )}

            <div className={styles.formElement}>
                <Input
                    label={'Имя пользователя'}
                    name={'name'}
                    disabled={loading}
                    value={formData?.name}
                    error={formErrors?.name}
                    onKeyDown={handleKeyPress}
                    onChange={handleChange}
                />
            </div>

            <div className={styles.formElement}>
                <Input
                    label={'Email адрес'}
                    name={'email'}
                    disabled={loading}
                    value={formData?.email}
                    error={formErrors?.email}
                    onKeyDown={handleKeyPress}
                    onChange={handleChange}
                />
            </div>

            <div className={styles.formElement}>
                <Input
                    label={'Пароль'}
                    name={'password'}
                    type={'password'}
                    disabled={loading}
                    value={formData?.password}
                    error={formErrors?.password}
                    onKeyDown={handleKeyPress}
                    onChange={handleChange}
                />
            </div>

            <div className={styles.formElement}>
                <Input
                    label={'Повторите пароль'}
                    name={'repeat_password'}
                    type={'password'}
                    disabled={loading}
                    value={formData?.repeat_password}
                    error={formErrors?.repeat_password}
                    onKeyDown={handleKeyPress}
                    onChange={handleChange}
                />
            </div>

            <div className={styles.actions}>
                <Button
                    mode={'primary'}
                    disabled={loading}
                    onClick={handleSubmit}
                >
                    {'Зарегистрироваться'}
                </Button>

                <Button
                    mode={'secondary'}
                    disabled={loading}
                    onClick={onCancel}
                >
                    {'Отмена'}
                </Button>
            </div>
        </div>
    )
}
export default RegistrationForm
