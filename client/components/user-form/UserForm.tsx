import { Trans, useTranslation } from 'next-i18next'
import Image from 'next/image'
import React, { useCallback, useEffect, useState } from 'react'

import Button from '@/ui/button'
import Checkbox from '@/ui/checkbox'
import Input from '@/ui/input'
import Message from '@/ui/message'
import ScreenSpinner from '@/ui/screen-spinner'

import { ApiTypes } from '@/api/types'
import { User, UserSettingEnum, UserSettings } from '@/api/types/User'

import googleLogo from '@/public/images/google-logo.png'
import yandexLogo from '@/public/images/yandex-logo.png'

import styles from './styles.module.sass'

interface UserFormProps {
    loading?: boolean
    values?: User
    errors?: ApiTypes.RequestUsersPatch
    onSubmit?: (formData?: ApiTypes.RequestUsersPatch) => void
    onCancel?: () => void
}

type FormDataType = ApiTypes.RequestUsersPatch & { confirmPassword?: string }

const TKEY = 'components.userForm.'

const UserForm: React.FC<UserFormProps> = ({
    loading,
    values,
    errors,
    onSubmit,
    onCancel
}) => {
    const { t } = useTranslation()

    const [formErrors, setFormErrors] = useState<FormDataType>()
    const [formData, setFormData] = useState<FormDataType>(
        mapFormValues(values)
    )

    const disabled =
        JSON.stringify(mapFormValues(values)?.settings) ===
            JSON.stringify(formData.settings) &&
        values?.name === formData?.name &&
        values?.website === formData?.website &&
        !formData?.newPassword &&
        !formData?.oldPassword

    const handleChange = ({
        target: { name, value }
    }: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [name]: value })
    }

    const handleChangeCheckbox = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setFormData({
            ...formData,
            settings: {
                ...formData?.settings,
                [event.target.id as UserSettingEnum]: event.target.checked
            }
        })
    }

    const validateForm = useCallback(() => {
        const errors: FormDataType = {}

        if (!formData?.name) {
            errors.name = t(`${TKEY}errorName`)
        }

        if (formData?.newPassword && !formData?.oldPassword) {
            errors.oldPassword = t(`${TKEY}errorOldPassword`)
        }

        if (!formData?.newPassword && formData?.oldPassword) {
            errors.newPassword = t(`${TKEY}errorNewPassword`)
        }

        if (
            formData?.oldPassword &&
            formData?.newPassword?.length! > 0 &&
            formData?.newPassword !== formData?.confirmPassword
        ) {
            errors.confirmPassword = t(`${TKEY}errorConfirmPassword`)
        }

        if (formData?.newPassword && formData?.newPassword?.length < 8) {
            errors.newPassword = t(`${TKEY}errorPasswordLength`)
        }

        setFormErrors(errors)

        return !Object.keys(errors).length
    }, [formData])

    const handleSubmit = () => {
        if (validateForm() && !disabled) {
            onSubmit?.(formData)
        }
    }

    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            handleSubmit()
        }
    }

    useEffect(() => {
        setFormData(mapFormValues(values))
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
                    title={t(`${TKEY}errorsMessageTitle`)}
                    list={Object.values(formErrors || {})}
                />
            )}

            <div>
                <h3 className={styles.header}>
                    {t(`${TKEY}titleGeneralSettings`)}
                </h3>
                <div className={styles.formElement}>
                    <Input
                        tabIndex={0}
                        autoFocus={true}
                        name={'name'}
                        label={t(`${TKEY}inputNameLabel`)}
                        placeholder={t(`${TKEY}inputNamePlaceholder`)}
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
                        label={t(`${TKEY}inputWebsiteLabel`)}
                        placeholder={t(`${TKEY}inputWebsitePlaceholder`)}
                        disabled={loading}
                        value={formData?.website}
                        error={formErrors?.website}
                        onKeyDown={handleKeyPress}
                        onChange={handleChange}
                    />
                </div>
            </div>

            <div className={styles.section}>
                <h3 className={styles.header}>
                    {t(`${TKEY}titleEmailSettings`)}
                </h3>
                {[
                    'emailPhoto',
                    'emailRating',
                    'emailComment',
                    'emailEdit',
                    'emailCover'
                ].map((setting) => (
                    <Checkbox
                        className={styles.settings}
                        key={setting}
                        id={setting}
                        label={t(`${TKEY}${setting}`)}
                        disabled={loading}
                        onChange={handleChangeCheckbox}
                        checked={
                            formData?.settings?.[setting as keyof UserSettings]
                        }
                    />
                ))}
            </div>

            <div className={styles.section}>
                <h3 className={styles.header}>
                    {t(`${TKEY}titleChangePassword`)}
                </h3>
                {values?.authType === 'native' ? (
                    <>
                        <div className={styles.formElement}>
                            <Input
                                name={'oldPassword'}
                                label={t(`${TKEY}currentPassword`)}
                                type={'password'}
                                placeholder={t(
                                    `${TKEY}currentPasswordPlaceholder`
                                )}
                                disabled={loading}
                                value={formData?.oldPassword}
                                error={formErrors?.oldPassword}
                                onKeyDown={handleKeyPress}
                                onChange={handleChange}
                            />
                        </div>

                        <div className={styles.formElement}>
                            <Input
                                name={'newPassword'}
                                label={t(`${TKEY}newPassword`)}
                                type={'password'}
                                placeholder={t(`${TKEY}newPasswordPlaceholder`)}
                                disabled={loading}
                                value={formData?.newPassword}
                                error={formErrors?.newPassword}
                                onKeyDown={handleKeyPress}
                                onChange={handleChange}
                            />
                        </div>

                        <div className={styles.formElement}>
                            <Input
                                name={'confirmPassword'}
                                label={t(`${TKEY}confirmPassword`)}
                                type={'password'}
                                placeholder={t(
                                    `${TKEY}confirmPasswordPlaceholder`
                                )}
                                disabled={loading}
                                value={formData?.confirmPassword}
                                error={formErrors?.confirmPassword}
                                onKeyDown={handleKeyPress}
                                onChange={handleChange}
                            />
                        </div>
                    </>
                ) : (
                    <div className={styles.authService}>
                        <Image
                            src={
                                values?.authType === 'google'
                                    ? googleLogo.src
                                    : yandexLogo.src
                            }
                            width={48}
                            height={48}
                            alt={''}
                        />
                        <p>
                            <Trans
                                i18nKey={'components.userForm.loginViaService'}
                                values={{
                                    service:
                                        values?.authType === 'google'
                                            ? 'Google'
                                            : 'Yandex'
                                }}
                            />
                        </p>
                    </div>
                )}
            </div>

            <div className={styles.actions}>
                <Button
                    size={'m'}
                    mode={'primary'}
                    loading={loading}
                    disabled={loading || disabled}
                    onClick={handleSubmit}
                >
                    {t(`${TKEY}buttonSave`)}
                </Button>

                <Button
                    size={'m'}
                    mode={'secondary'}
                    disabled={loading}
                    onClick={onCancel}
                >
                    {t(`${TKEY}buttonCancel`)}
                </Button>
            </div>
        </section>
    )
}

const mapFormValues = (values?: FormDataType): FormDataType => ({
    id: values?.id ?? '',
    name: values?.name ?? '',
    newPassword: '',
    oldPassword: '',
    settings: {
        emailComment: values?.settings?.emailComment ?? true,
        emailCover: values?.settings?.emailCover ?? true,
        emailEdit: values?.settings?.emailEdit ?? true,
        emailPhoto: values?.settings?.emailPhoto ?? true,
        emailPlace: values?.settings?.emailPlace ?? true,
        emailRating: values?.settings?.emailRating ?? true
    },
    website: values?.website
})

export default UserForm
