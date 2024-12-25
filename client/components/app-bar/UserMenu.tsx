import React from 'react'
import { TFunction } from 'i18next'
import Image from 'next/image'
import Link from 'next/link'
import { Icon, Popout } from 'simple-react-ui-kit'

import styles from './styles.module.sass'

import { ApiModel } from '@/api'
import UserAvatar from '@/components/user-avatar'
import { levelImage } from '@/functions/userLevels'

interface UserMenuProps {
    t: TFunction
    user?: ApiModel.User
    onLogout?: () => void
}

const UserMenu: React.FC<UserMenuProps> = ({ t, user, onLogout }) => (
    <Popout
        mode={'outline'}
        className={styles.userMenuPopout}
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
                    title={t('go-to-my-page')}
                >
                    <Icon name={'User'} />
                    {t('my-page')}
                </Link>
            </li>
            <li>
                <Link
                    href={'/users/settings'}
                    title={t('go-to-settings')}
                >
                    <Icon name={'Settings'} />
                    {t('settings')}
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
                    {t('logout')}
                </Link>
            </li>
        </ul>
    </Popout>
)

export default UserMenu
