import React, { useEffect, useState } from 'react'
import { cn, Container, Dialog, Icon } from 'simple-react-ui-kit'

import { useTranslation } from 'next-i18next/pages'
import NextNProgress from 'nextjs-progressbar'

import { closeAuthDialog } from '@/app/applicationSlice'
import { useAppDispatch, useAppSelector } from '@/app/store'

import { AppBar } from './app-bar'
import { BottomNav } from './bottom-nav'
import { LoginForm } from './login-form'
import { RegistrationForm } from './registration-form'
import { Snackbar } from './snackbar'

import styles from './styles.module.sass'

type AuthFormType = 'login' | 'registration'

interface AppLayoutProps {
    className?: string
    fullSize?: boolean
    transparentBar?: boolean
    sidebar?: React.ReactNode
    sidebarTitle?: string
    children?: React.ReactNode
}

export const AppLayout: React.FC<AppLayoutProps> = ({
    className,
    fullSize,
    transparentBar,
    sidebar,
    sidebarTitle,
    children
}) => {
    const { t } = useTranslation()
    const dispatch = useAppDispatch()

    const application = useAppSelector((store) => store.application)

    const [authForm, setAuthForm] = useState<AuthFormType>('login')
    const [sidebarOpen, setSidebarOpen] = useState(false)

    useEffect(() => {
        document.body.style.overflow = sidebarOpen ? 'hidden' : ''
        return () => {
            document.body.style.overflow = ''
        }
    }, [sidebarOpen])

    const handleCloseAuthDialog = () => {
        setAuthForm('login')
        dispatch(closeAuthDialog())
    }

    return (
        <div className={cn(styles.appLayout, fullSize && styles.fullSize, className)}>
            <NextNProgress
                color={'#2688eb'}
                options={{ showSpinner: false }}
            />

            <Dialog
                open={application.showAuthDialog}
                onCloseDialog={handleCloseAuthDialog}
                maxWidth={'400px'}
            >
                {authForm === 'login' && <LoginForm onClickRegistration={() => setAuthForm('registration')} />}
                {authForm === 'registration' && <RegistrationForm onClickLogin={() => setAuthForm('login')} />}
            </Dialog>

            <AppBar
                fullSize={fullSize}
                transparent={transparentBar}
            />

            <main className={styles.main}>
                {sidebar ? (
                    <>
                        <div className={styles.mobileFilterBar}>
                            <button
                                className={styles.filterToggle}
                                onClick={() => setSidebarOpen((v) => !v)}
                            >
                                <Icon name={'Tune'} />
                                {sidebarTitle ?? t('filters')}
                            </button>
                        </div>

                        <div className={styles.mainRow}>
                            <aside className={cn(styles.sidebar, sidebarOpen && styles.sidebarOpen)}>
                                <Container className={styles.sidebarContainer}>
                                    <div className={styles.sidebarHeader}>
                                        {sidebarTitle && <div className={styles.sidebarTitle}>{sidebarTitle}</div>}
                                        <button
                                            className={styles.sidebarClose}
                                            onClick={() => setSidebarOpen(false)}
                                        >
                                            <Icon name={'Close'} />
                                        </button>
                                    </div>
                                    <div className={styles.sidebarBody}>{sidebar}</div>
                                </Container>
                            </aside>

                            <div className={styles.content}>{children}</div>
                        </div>
                    </>
                ) : (
                    children
                )}
            </main>

            {!fullSize && <BottomNav />}

            <Snackbar />
        </div>
    )
}
