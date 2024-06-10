import React from 'react'

import Breadcrumbs, { BreadcrumbsProps } from '@/ui/breadcrumbs'
import Button from '@/ui/button'
import Container from '@/ui/container'

import { User } from '@/api/types/User'

import UserAvatar from '@/components/user-avatar'

import { concatClassNames as cn } from '@/functions/helpers'

import styles from './styles.module.sass'

interface HeaderProps extends BreadcrumbsProps {
    title?: string
    backLink?: string
    className?: string
    attachedBottom?: boolean
    userData?: User
    actions?: React.ReactNode
}

const Header: React.FC<HeaderProps> = ({
    title,
    backLink,
    className,
    attachedBottom,
    userData,
    actions,
    ...props
}) => (
    <Container
        className={cn(
            className,
            styles.header,
            attachedBottom && styles.attachedBottom
        )}
    >
        {backLink && (
            <Button
                className={styles.backLink}
                icon={'LargeLeft'}
                link={backLink}
            />
        )}
        {userData?.id && (
            <UserAvatar
                className={styles.userAvatar}
                user={userData}
                size={'medium'}
            />
        )}
        <header>
            <h1>{title}</h1>
            <Breadcrumbs {...props} />
        </header>
        {actions && <div className={styles.actions}>{actions}</div>}
    </Container>
)

export default Header
