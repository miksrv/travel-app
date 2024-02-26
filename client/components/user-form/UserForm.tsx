import { useTranslation } from 'next-i18next'
import React, { useCallback, useEffect, useState } from 'react'

import Button from '@/ui/button'
import Input from '@/ui/input'
import Message from '@/ui/message'
import ScreenSpinner from '@/ui/screen-spinner'

import { ApiTypes } from '@/api/types'

import styles from './styles.module.sass'

interface UserFormProps {
    loading?: boolean
    values?: ApiTypes.RequestUsersPatch
    errors?: ApiTypes.RequestUsersPatch
    onSubmit?: (formData?: ApiTypes.RequestUsersPatch) => void
    onCancel?: () => void
}

const UserForm: React.FC<UserFormProps> = ({
    loading,
    values,
    errors,
    onSubmit,
    onCancel
}) => {
    const { t } = useTranslation('common', {
        keyPrefix: 'components.userForm'
    })

    const [formData, setFormData] = useState<ApiTypes.RequestUsersPatch>()
    const [formErrors, setFormErrors] = useState<ApiTypes.RequestUsersPatch>()

    const disabled =
        values?.name === formData?.name && values?.website === formData?.website

    const handleChange = ({
        target: { name, value }
    }: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [name]: value })
    }

    const validateForm = useCallback(() => {
        const errors: ApiTypes.RequestUsersPatch = {}

        if (!formData?.name) {
            errors.name = t('errorName')
        }

        setFormErrors(errors)

        return !Object.keys(errors).length
    }, [formData])

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
        if (values) {
            setFormData(values)
        }
    }, [values])

    useEffect(() => {
        setFormErrors(errors)
    }, [errors])

    return (
        <section className={styles.component}>
            {loading && <ScreenSpinner />}

            {!!Object.values(formErrors || {})?.length && (
                <Message
                    type={'negative'}
                    title={t('errorsMessageTitle')}
                    list={Object.values(formErrors || {})}
                />
            )}

            <div className={styles.formElement}>
                <Input
                    name={'name'}
                    label={t('inputNameLabel')}
                    placeholder={t('inputNamePlaceholder')}
                    disabled={loading}
                    value={formData?.name}
                    error={formErrors?.name}
                    onKeyDown={handleKeyPress}
                    onChange={handleChange}
                />
            </div>

            <div className={styles.formElement}>
                <Input
                    name={'website'}
                    label={t('inputWebsiteLabel')}
                    placeholder={t('inputWebsitePlaceholder')}
                    disabled={loading}
                    value={formData?.website}
                    error={formErrors?.website}
                    onKeyDown={handleKeyPress}
                    onChange={handleChange}
                />
            </div>

            <div className={styles.actions}>
                <Button
                    size={'m'}
                    mode={'primary'}
                    disabled={loading || disabled}
                    onClick={handleSubmit}
                >
                    {t('buttonSave')}
                </Button>

                <Button
                    size={'m'}
                    mode={'secondary'}
                    disabled={loading}
                    onClick={onCancel}
                >
                    {t('buttonCancel')}
                </Button>
            </div>
        </section>
    )
}
export default UserForm
