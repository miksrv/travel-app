import React, { useEffect, useRef, useState } from 'react'
import { cn, Icon } from 'simple-react-ui-kit'

import { useTranslation } from 'next-i18next'
import NextNProgress from 'nextjs-progressbar'

import { useAppDispatch, useAppSelector } from '@/api'
import { closeAuthDialog } from '@/api/applicationSlice'
import AppBar from '@/components/app-bar'
import Footer from '@/components/footer'
import LanguageSwitcher from '@/components/language-switcher'
import LoginForm from '@/components/login-form'
import RegistrationForm from '@/components/registration-form'
import Snackbar from '@/components/snackbar'
import ThemeSwitcher from '@/components/theme-switcher'
import Dialog from '@/ui/dialog'

import Menu from './Menu'

import styles from './styles.module.sass'

type AuthFormType = 'login' | 'registration'

interface AppLayoutProps {
    className?: string
    fullSize?: boolean
    children?: React.ReactNode
}

const AppLayout: React.FC<AppLayoutProps> = ({ className, fullSize, children }) => {
    const dispatch = useAppDispatch()
    const { t } = useTranslation()

    const authSlice = useAppSelector((state) => state.auth)
    const application = useAppSelector((store) => store.application)

    const [leftDistance, setLeftDistance] = useState<number>()
    const [scrollTopVisible, setScrollTopVisible] = useState<boolean>(false)
    const menuBarRef = useRef<HTMLDivElement>(null)

    const [sidebarOpen, setSidebarOpen] = useState<boolean>(false)
    const [authForm, setAuthForm] = useState<AuthFormType>('login')

    const handleCloseOverlay = () => {
        setSidebarOpen(false)
    }

    const handleOpenSideBar = () => {
        setSidebarOpen(true)
    }

    const handleCloseAuthDialog = () => {
        setAuthForm('login')
        dispatch(closeAuthDialog())
    }

    const handleScrollToTop = () => {
        window.scrollTo(0, 0)
    }

    useEffect(() => {
        const handleScroll = () => {
            setScrollTopVisible(window.scrollY > 500)
        }

        const handleResize = () => {
            if (menuBarRef.current) {
                const rect = menuBarRef.current.getBoundingClientRect()

                setLeftDistance(rect.left + rect.width - 5)
            }
        }

        handleResize()

        window.addEventListener('scroll', handleScroll)
        window.addEventListener('resize', handleResize)

        return () => {
            window.removeEventListener('scroll', handleScroll)
            window.removeEventListener('resize', handleResize)
        }
    }, [])

    useEffect(() => {
        if (application.showOverlay || sidebarOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'auto'
        }

        return () => {
            document.body.style.overflow = 'auto'
        }
    }, [application.showOverlay, sidebarOpen])

    return (
        <div className={cn(className, styles.appLayout, fullSize && styles.fullSize)}>
            <NextNProgress
                color={'#2688eb'}
                options={{ showSpinner: false }}
            />

            <div
                tabIndex={0}
                role={'button'}
                className={styles.scrollArea}
                style={{
                    display: scrollTopVisible ? 'block' : 'none',
                    width: leftDistance
                }}
                onKeyDown={() => undefined}
                onClick={handleScrollToTop}
            >
                <div className={styles.buttonToTop}>
                    <Icon name={'KeyboardUp'} />
                    {t('scroll-to-top')}
                </div>
            </div>

            <div
                role={'button'}
                tabIndex={0}
                className={cn(
                    styles.overlay,
                    application.showOverlay || sidebarOpen ? styles.displayed : styles.hidden
                )}
                onKeyDown={handleCloseOverlay}
                onClick={handleCloseOverlay}
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
                onMenuClick={handleOpenSideBar}
            />

            <aside className={cn(styles.sidebar, sidebarOpen ? styles.opened : styles.closed)}>
                <Menu
                    type={'mobile'}
                    userId={authSlice.user?.id}
                    isAuth={authSlice.isAuth}
                    onClick={handleCloseOverlay}
                />
                <div className={styles.content}>
                    <div className={styles.switchers}>
                        <ThemeSwitcher />
                        <LanguageSwitcher />
                    </div>
                    <Footer />
                </div>
            </aside>

            <section className={styles.mainContainer}>
                <aside
                    className={styles.menubar}
                    ref={menuBarRef}
                >
                    <div className={styles.rails}>
                        <Menu
                            type={'desktop'}
                            userId={authSlice.user?.id}
                            isAuth={authSlice.isAuth}
                        />
                        <div className={styles.switchers}>
                            <ThemeSwitcher />
                            <LanguageSwitcher />
                        </div>
                        <Footer />
                    </div>
                </aside>
                <main className={styles.main}>{children}</main>
            </section>

            <Snackbar />
        </div>
    )
}

export default AppLayout
