import React from 'react'
import { TFunction } from 'i18next'
import Image from 'next/image'
import Link from 'next/link'

import styles from './styles.module.sass'

import { User } from '@/api/types/User'
import UserAvatar from '@/components/user-avatar'
import { levelImage } from '@/functions/userLevels'
import Icon from '@/ui/icon'
import Popout from '@/ui/popout'

interface UserMenuProps {
    user?: User
    onLogout?: () => void
    t?: TFunction
}

const UserMenu: React.FC<UserMenuProps> = ({ user, onLogout, t }) => (
    <Popout
        action={
            <UserAvatar
                size={'medium'}
                user={user}
                disableLink={true}
                hideOnlineIcon={true}
            />
        }
    >
        <div className={styles.userInfo}>
            <div className={styles.userName}>{user?.name}</div>
            <div>
                [<b>{user?.levelData?.level}</b>]{' '}
                <Image
                    className={styles.levelImage}
                    src={levelImage(user?.levelData?.level).src}
                    alt={''}
                    width={20}
                    height={20}
                />{' '}
                <Link
                    href={'/users/levels'}
                    title={''}
                >
                    {user?.levelData?.title}
                </Link>
            </div>
            <div>До нового уровня: {(user?.levelData?.nextLevel || 0) - (user?.levelData?.experience || 0)}</div>
        </div>
        <ul className={'contextListMenu'}>
            <li>
                <Link
                    href={`/users/${user?.id}`}
                    title={translate?.('go-to-my-page')}
                >
                    <Icon name={'User'} />
                    {translate?.('my-page')}
                </Link>
            </li>
            <li>
                <Link
                    href={'/users/settings'}
                    title={translate?.('go-to-settings')}
                >
                    <Icon name={'Settings'} />
                    {translate?.('settings')}
                </Link>
            </li>
            <li>
                <Link
                    href={'/'}
                    title={''}
                    onClick={(event) => {
                        event.preventDefault()
                        onLogout?.()
                    }}
                >
                    <Icon name={'Exit'} />
                    {translate?.('logout')}
                </Link>
            </li>
        </ul>
    </Popout>
)

export default UserMenu
