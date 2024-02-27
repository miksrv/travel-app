import { useTranslation } from 'next-i18next'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

import { IMG_HOST } from '@/api/api'
import { User } from '@/api/types/User'

import { concatClassNames as cn, minutesAgo } from '@/functions/helpers'

import defaultAvatar from '@/public/images/no-avatar.png'

import styles from './styles.module.sass'

type SizeType = 'small' | 'tiny' | 'medium'

interface AvatarProps {
    className?: string
    user?: User
    size?: SizeType
    caption?: string | React.ReactNode
    loading?: boolean
    showName?: boolean
    disableLink?: boolean
    hideOnlineIcon?: boolean
}

const getDimension = (size?: SizeType) =>
    size === 'medium' ? 36 : size === 'tiny' ? 32 : 20

const UserAvatar: React.FC<AvatarProps> = (props) => {
    const { t } = useTranslation('common', {
        keyPrefix: 'components.userAvatar'
    })

    const { className, user, size, caption, showName, disableLink } = props

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
                        title={`${t('linkTitle')} ${user?.name}`}
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
                <div
                    className={cn(
                        styles.info,
                        size === 'medium' ? styles.medium : styles.small
                    )}
                >
                    <Link
                        href={`/users/${user.id}`}
                        title={`${t('linkTitle')} ${user?.name}`}
                    >
                        {user?.name}
                    </Link>
                    {caption && <div className={styles.caption}>{caption}</div>}
                </div>
            )}
        </div>
    )
}

const AvatarImage: React.FC<AvatarProps> = ({ user, size, hideOnlineIcon }) => (
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

        {!hideOnlineIcon &&
            user?.activity?.date &&
            minutesAgo(user.activity.date) <= 15 && (
                <div className={styles.online} />
            )}
    </>
)

export default UserAvatar
