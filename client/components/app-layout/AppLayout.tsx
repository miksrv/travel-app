import React, { useEffect, useState } from 'react'

import Dialog from '@/ui/dialog'

import { API } from '@/api/api'
import { closeAuthDialog } from '@/api/applicationSlice'
import { addNotification } from '@/api/snackbarSlice'
import { useAppDispatch, useAppSelector } from '@/api/store'

import AppBar from '@/components/app-bar'
import Footer from '@/components/footer'
import LanguageSwitcher from '@/components/language-switcher'
import LoginForm from '@/components/login-form'
import Snackbar from '@/components/snackbar'

import { concatClassNames as cn } from '@/functions/helpers'

import Menu from './Menu'
import styles from './styles.module.sass'

interface AppLayoutProps {
    randomPlaceId?: string
    fullSize?: boolean
    children?: React.ReactNode
}

const AppLayout: React.FC<AppLayoutProps> = ({
    randomPlaceId,
    fullSize,
    children
}) => {
    const dispatch = useAppDispatch()
    const authSlice = useAppSelector((state) => state.auth)
    const application = useAppSelector((store) => store.application)

    const { data: notifications } = API.useNotificationsGetListQuery(
        undefined,
        {
            pollingInterval: 30 * 1000,
            skip: !authSlice.isAuth
        }
    )

    const [sidebarOpen, setSidebarOpen] = useState<boolean>(false)

    const handleCloseOverlay = () => {
        setSidebarOpen(false)
    }

    const handleOpenSideBar = () => {
        setSidebarOpen(true)
    }

    const handleCloseAuthDialog = () => {
        dispatch(closeAuthDialog())
    }

    useEffect(() => {
        notifications?.items?.forEach((item) => {
            dispatch(addNotification(item))
        })
    }, [notifications])

    useEffect(() => {
        if (application?.showOverlay || sidebarOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'auto'
        }

        return () => {
            document.body.style.overflow = 'auto'
        }
    }, [application?.showOverlay, sidebarOpen])

    return (
        <div className={cn(styles.component, fullSize && styles.fullSize)}>
            <div
                role={'button'}
                tabIndex={0}
                className={cn(
                    styles.overlay,
                    application?.showOverlay || sidebarOpen
                        ? styles.displayed
                        : styles.hidden
                )}
                onKeyDown={handleCloseOverlay}
                onClick={handleCloseOverlay}
            />

            <Dialog
                open={application.showAuthDialog}
                onCloseDialog={handleCloseAuthDialog}
            >
                <LoginForm />
            </Dialog>

            <AppBar
                fullSize={fullSize}
                randomPlaceId={randomPlaceId}
                onMenuClick={handleOpenSideBar}
            />

            <aside
                className={cn(
                    styles.sidebar,
                    sidebarOpen ? styles.opened : styles.closed
                )}
            >
                <Menu
                    type={'mobile'}
                    userId={authSlice?.user?.id}
                    isAuth={authSlice?.isAuth}
                    onClick={handleCloseOverlay}
                />
            </aside>

            <section className={styles.mainContainer}>
                <aside className={styles.menubar}>
                    <Menu
                        type={'desktop'}
                        userId={authSlice?.user?.id}
                        isAuth={authSlice?.isAuth}
                    />
                    <LanguageSwitcher />
                    <Footer />
                </aside>
                <main className={styles.main}>{children}</main>
            </section>

            <Snackbar />
        </div>
    )
}

export default AppLayout
