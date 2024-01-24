import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

import { IMG_HOST } from '@/api/api'
import { User } from '@/api/types/User'

import { concatClassNames as cn } from '@/functions/helpers'

import defaultAvatar from '@/public/images/no-avatar.png'

import styles from './styles.module.sass'

type SizeType = 'small' | 'medium'

interface AvatarProps {
    className?: string
    user?: User
    size?: SizeType
    caption?: string | React.ReactNode
    loading?: boolean
    showName?: boolean
}

const getDimension = (size?: SizeType) => (size === 'medium' ? 36 : 20)

const UserAvatar: React.FC<AvatarProps> = ({
    className,
    user,
    size,
    caption,
    showName
}) => (
    <div className={cn(styles.userAvatar, className)}>
        {user?.id ? (
            <Link
                className={styles.avatarLink}
                href={`/users/${user.id}`}
                title={`Профиль пользователя ${user?.name}`}
            >
                <Image
                    alt={`Фото профиля пользователя ${user?.name}` || ''}
                    className={styles.avatarImage}
                    src={
                        user?.avatar
                            ? `${IMG_HOST}avatar/${user.avatar}`
                            : defaultAvatar.src
                    }
                    width={getDimension(size)}
                    height={getDimension(size)}
                />
                <div
                    aria-hidden={true}
                    className={styles.avatarBorder}
                />
            </Link>
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
                    title={`Профиль пользователя ${user?.name}`}
                >
                    {user?.name}
                </Link>
                {caption && <div className={styles.caption}>{caption}</div>}
            </div>
        )}
    </div>
)

export default UserAvatar
