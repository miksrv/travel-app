import React from 'react'
import { useTranslation } from 'next-i18next'

import 'react-image-crop/src/ReactCrop.scss'

import styles from './styles.module.sass'

import { toggleOverlay } from '@/api/applicationSlice'
import { useAppDispatch, useAppSelector } from '@/api/store'
import Button from '@/ui/button'
import Dialog, { DialogProps } from '@/ui/dialog'

interface ConfirmationDialogProps extends DialogProps {
    open?: boolean
    message?: string
    acceptText?: string
    rejectText?: string
    onAccept?: () => void
    onReject?: () => void
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
    open,
    message,
    acceptText,
    rejectText,
    onAccept,
    onReject
}) => {
    const { t } = useTranslation('common', {
        keyPrefix: 'components.confirmationDialog'
    })

    const dispatch = useAppDispatch()
    const overlay = useAppSelector((state) => state.application.showOverlay)

    const handleCoverDialogClose = () => {
        dispatch(toggleOverlay(false))
        onReject?.()
    }

    React.useEffect(() => {
        if (open && !overlay) {
            dispatch(toggleOverlay(true))
        } else if (!open && overlay) {
            dispatch(toggleOverlay(false))
        }
    }, [open])

    return (
        <Dialog
            maxWidth={'400px'}
            open={open}
            onCloseDialog={handleCoverDialogClose}
        >
            <p className={styles.message}>{message ?? t('defaultText')}</p>

            <div className={styles.bottomActions}>
                <Button
                    size={'small'}
                    mode={'secondary'}
                    onClick={onReject}
                >
                    {rejectText ?? t('defaultRejectButton')}
                </Button>

                <Button
                    size={'small'}
                    variant={'negative'}
                    mode={'primary'}
                    onClick={onAccept}
                >
                    {acceptText ?? t('defaultAcceptButton')}
                </Button>
            </div>
        </Dialog>
    )
}
export default ConfirmationDialog
