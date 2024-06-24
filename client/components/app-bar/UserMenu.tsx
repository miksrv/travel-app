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
    translate?: TFunction
}

const UserMenu: React.FC<UserMenuProps> = ({ user, onLogout, translate }) => (
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
                [<b>{user?.level?.level}</b>]{' '}
                <Image
                    className={styles.levelImage}
                    src={levelImage(user?.level?.level).src}
                    alt={''}
                    width={20}
                    height={20}
                />{' '}
                <Link
                    href={'/users/levels'}
                    title={''}
                >
                    {user?.level?.title}
                </Link>
            </div>
            <div>
                До нового уровня:{' '}
                {(user?.level?.nextLevel || 0) - (user?.level?.experience || 0)}
            </div>
        </div>
        <ul className={styles.userMenu}>
            <li>
                <Link
                    href={`/users/${user?.id}`}
                    title={translate?.('userProfileTitle')}
                >
                    <Icon name={'User'} />
                    {translate?.('userProfileCaption')}
                </Link>
            </li>
            <li>
                <Link
                    href={'/users/settings'}
                    title={translate?.('userSettingsTitle')}
                >
                    <Icon name={'Settings'} />
                    {translate?.('userSettingsCaption')}
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
                    {translate?.('userLogout')}
                </Link>
            </li>
        </ul>
    </Popout>
)

export default UserMenu
