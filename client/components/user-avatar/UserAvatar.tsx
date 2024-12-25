import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslation } from 'next-i18next'
import { cn } from 'simple-react-ui-kit'

import styles from './styles.module.sass'

import { ApiModel, IMG_HOST } from '@/api'
import { minutesAgo } from '@/functions/helpers'
import defaultAvatar from '@/public/images/no-avatar.png'

type SizeType = 'small' | 'tiny' | 'medium'

export interface UserAvatarProps {
    className?: string
    user?: ApiModel.User
    size?: SizeType
    caption?: string | React.ReactNode
    loading?: boolean
    showName?: boolean
    disableLink?: boolean
    hideOnlineIcon?: boolean
}

const getDimension = (size?: SizeType) => (size === 'medium' ? 36 : size === 'tiny' ? 32 : 20)

const UserAvatar: React.FC<UserAvatarProps> = (props) => {
    const { className, user, size, caption, showName, disableLink } = props
    const { t } = useTranslation()

    return (
        <div className={cn(styles.userAvatar, className)}>
            {user?.id ? (
                disableLink ? (
                    <span
                        className={styles.avatarLink}
                        style={{
                            height: getDimension(size),
                            width: getDimension(size)
                        }}
                    >
                        <AvatarImage {...props} />
                    </span>
                ) : (
                    <Link
                        className={styles.avatarLink}
                        href={`/users/${user.id}`}
                        title={`${t('user-profile')} ${user.name}`}
                        style={{
                            height: getDimension(size),
                            width: getDimension(size)
                        }}
                    >
                        <AvatarImage {...props} />
                    </Link>
                )
            ) : (
                <Image
                    alt={''}
                    className={styles.avatarImage}
                    src={defaultAvatar.src}
                    width={getDimension(size)}
                    height={getDimension(size)}
                />
            )}

            {showName && user?.id && (
                <div className={cn(styles.info, size === 'medium' ? styles.medium : styles.small)}>
                    <Link
                        href={`/users/${user.id}`}
                        title={`${t('user-profile')} ${user.name}`}
                    >
                        {user.name}
                    </Link>
                    {caption && <div className={styles.caption}>{caption}</div>}
                </div>
            )}
        </div>
    )
}

// TODO: Move to separate component
const AvatarImage: React.FC<UserAvatarProps> = ({ user, size, hideOnlineIcon }) => (
    <>
        <Image
            alt={''}
            className={styles.avatarImage}
            src={user?.avatar ? `${IMG_HOST}${user.avatar}` : defaultAvatar.src}
            width={getDimension(size)}
            height={getDimension(size)}
        />

        <div
            aria-hidden={true}
            className={styles.avatarBorder}
        />

        {!hideOnlineIcon && user?.activity?.date && minutesAgo(user.activity.date) <= 15 && (
            <div className={styles.online} />
        )}
    </>
)

export default UserAvatar
