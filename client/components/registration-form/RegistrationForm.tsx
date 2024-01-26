'use client'

import React, { useState } from 'react'

import Button from '@/ui/button'
import Input from '@/ui/input'

import { ApiTypes } from '@/api/types'

import styles from './styles.module.sass'

interface RegistrationFormProps {
    loading?: boolean
    onSubmit?: (formData?: ApiTypes.RequestAuthRegistration) => void
    onCancel?: () => void
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({
    loading,
    onSubmit,
    onCancel
}) => {
    const [formData, setFormState] =
        useState<ApiTypes.RequestAuthRegistration>()

    const handleChange = ({
        target: { name, value }
    }: React.ChangeEvent<HTMLInputElement>) => {
        setFormState((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = () => {
        onSubmit?.(formData)
    }

    return (
        <div className={styles.registrationForm}>
            <div className={styles.formElement}>
                <Input
                    label={'Имя пользователя'}
                    name={'name'}
                    disabled={loading}
                    onChange={handleChange}
                />
            </div>

            <div className={styles.formElement}>
                <Input
                    label={'Email адрес'}
                    name={'email'}
                    disabled={loading}
                    onChange={handleChange}
                />
            </div>

            <div className={styles.formElement}>
                <Input
                    label={'Пароль'}
                    name={'password'}
                    type={'password'}
                    disabled={loading}
                    onChange={handleChange}
                />
            </div>

            <div className={styles.formElement}>
                <Input
                    label={'Повторите пароль'}
                    name={'repeat_password'}
                    type={'password'}
                    disabled={loading}
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
