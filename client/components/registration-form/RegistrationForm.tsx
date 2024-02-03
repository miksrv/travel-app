'use client'

import { useTranslation } from 'next-i18next'
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
    const { t } = useTranslation('common', {
        keyPrefix: 'components.placesList.registrationForm'
    })

    const [formData, setFormData] = useState<FormDataType>()
    const [formErrors, setFormErrors] = useState<FormDataType>()

    const validateForm = useCallback(() => {
        const errors: FormDataType = {}

        if (!formData?.name) {
            errors.name = t('errorName')
        }

        if (!validateEmail(formData?.email)) {
            errors.email = t('errorEmail')
        }

        if (!formData?.password) {
            errors.password = t('errorPassword')
        }

        if (formData?.password && formData?.password?.length < 8) {
            errors.password = t('errorPasswordLength')
        }

        if (
            !formData?.repeat_password ||
            formData?.repeat_password !== formData?.password
        ) {
            errors.repeat_password = t('errorPasswordMismatch')
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
                    title={t('errorsMessageTitle')}
                    list={Object.values(formErrors || {})}
                />
            )}

            <div className={styles.formElement}>
                <Input
                    label={t('inputNameLabel')}
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
                    label={t('inputEmailLabel')}
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
                    label={t('inputPasswordLabel')}
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
                    label={t('inputPasswordRepeatLabel')}
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
                    {t('buttonRegistration')}
                </Button>

                <Button
                    mode={'secondary'}
                    disabled={loading}
                    onClick={onCancel}
                >
                    {t('buttonCancel')}
                </Button>
            </div>
        </div>
    )
}
export default RegistrationForm
