import { useCallback, useEffect, useRef, useState } from 'react'
import NProgress from 'nprogress'

import Router from 'next/router'

export const useConfirmLeave = (isDirty: boolean) => {
    const [isOpen, setIsOpen] = useState(false)
    const pendingUrlRef = useRef<string | null>(null)
    const confirmedRef = useRef(false)

    useEffect(() => {
        const handleRouteChangeStart = (url: string) => {
            if (isDirty && !confirmedRef.current) {
                pendingUrlRef.current = url
                setIsOpen(true)
                throw 'Route change aborted'
            }
            confirmedRef.current = false
        }

        Router.events.on('routeChangeStart', handleRouteChangeStart)
        return () => {
            Router.events.off('routeChangeStart', handleRouteChangeStart)
        }
    }, [isDirty])

    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirty) {
                e.preventDefault()
                e.returnValue = ''
            }
        }

        window.addEventListener('beforeunload', handleBeforeUnload)
        return () => window.removeEventListener('beforeunload', handleBeforeUnload)
    }, [isDirty])

    const handleConfirm = useCallback(() => {
        confirmedRef.current = true
        setIsOpen(false)
        if (pendingUrlRef.current) {
            void Router.push(pendingUrlRef.current)
            pendingUrlRef.current = null
        }
    }, [])

    const handleCancel = useCallback(() => {
        pendingUrlRef.current = null
        setIsOpen(false)
        NProgress.done()
    }, [])

    // Call this before a programmatic router.push to bypass the dialog.
    // Needed because setIsDirty(false) + router.push() race: the React state
    // update is async, so the handler still sees isDirty=true when the route
    // event fires.
    const allowNavigation = useCallback(() => {
        confirmedRef.current = true
    }, [])

    return { isOpen, handleConfirm, handleCancel, allowNavigation }
}
