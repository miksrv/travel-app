'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/dist/client/router'
import { useTranslation } from 'next-i18next'

import styles from './styles.module.sass'

import { API, isApiValidationErrors } from '@/api/api'
import { closeAuthDialog } from '@/api/applicationSlice'
import { login } from '@/api/authSlice'
import { useAppDispatch } from '@/api/store'
import { ApiTypes } from '@/api/types'
import { validateEmail } from '@/functions/validators'
import Button from '@/ui/button'
import Input from '@/ui/input'
import Message from '@/ui/message'

type FormDataType = ApiTypes.RequestAuthRegistration & {
    repeat_password?: string
}

interface RegistrationFormProps {
    onClickLogin?: () => void
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({ onClickLogin }) => {
    const dispatch = useAppDispatch()
    const router = useRouter()
    const { t } = useTranslation()

    const [formData, setFormData] = useState<FormDataType>()
    const [formErrors, setFormErrors] = useState<FormDataType>()

    const [registration, { data, error, isLoading }] = API.useAuthPostRegistrationMutation()

    const validationErrors = useMemo(
        () => (isApiValidationErrors<ApiTypes.RequestAuthRegistration>(error) ? error.messages : undefined),
        [error]
    )

    const validateForm = useCallback(() => {
        const errors: FormDataType = {}

        if (!formData?.name) {
            errors.name = t('error_name-required')
        }

        if (!validateEmail(formData?.email)) {
            errors.email = t('error_email-incorrect')
        }

        if (!formData?.password) {
            errors.password = t('error_password-required')
        }

        if (formData?.password && formData.password.length < 8) {
            errors.password = t('error_password-length')
        }

        if (!formData?.repeat_password || formData.repeat_password !== formData.password) {
            errors.repeat_password = t('error_password-mismatch')
        }

        setFormErrors(errors)

        return !Object.keys(errors).length
    }, [formData])

    const handleChange = ({ target: { name, value } }: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [name]: value })
    }

    const handleSubmit = () => {
        if (validateForm() && formData) {
            registration(formData)
        }
    }

    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            handleSubmit()
        }
    }

    useEffect(() => {
        setFormErrors(validationErrors)
    }, [error])

    useEffect(() => {
        if (data?.auth) {
            dispatch(login(data))
            router.push(`/users/${data.user?.id}`)
            dispatch(closeAuthDialog())
        }
    }, [data])

    return (
        <div className={styles.registrationForm}>
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
                    label={t('input_name')}
                    name={'name'}
                    disabled={isLoading}
                    value={formData?.name}
                    error={formErrors?.name}
                    onKeyDown={handleKeyPress}
                    onChange={handleChange}
                />
            </div>

            <div className={styles.formElement}>
                <Input
                    label={t('input_email')}
                    name={'email'}
                    disabled={isLoading}
                    value={formData?.email}
                    error={formErrors?.email}
                    onKeyDown={handleKeyPress}
                    onChange={handleChange}
                />
            </div>

            <div className={styles.formElement}>
                <Input
                    label={t('input_password')}
                    name={'password'}
                    type={'password'}
                    disabled={isLoading}
                    value={formData?.password}
                    error={formErrors?.password}
                    onKeyDown={handleKeyPress}
                    onChange={handleChange}
                />
            </div>

            <div className={styles.formElement}>
                <Input
                    label={t('input_password-repeat')}
                    name={'repeat_password'}
                    type={'password'}
                    disabled={isLoading}
                    value={formData?.repeat_password}
                    error={formErrors?.repeat_password}
                    onKeyDown={handleKeyPress}
                    onChange={handleChange}
                />
            </div>

            <div className={styles.actions}>
                <Button
                    mode={'primary'}
                    disabled={isLoading}
                    onClick={handleSubmit}
                >
                    {t('register')}
                </Button>

                <Button
                    mode={'secondary'}
                    disabled={isLoading}
                    onClick={onClickLogin}
                >
                    {t('cancel')}
                </Button>
            </div>
        </div>
    )
}
export default RegistrationForm
