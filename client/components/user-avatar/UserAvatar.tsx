import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

import { IMG_HOST } from '@/api/api'
import { User } from '@/api/types/User'

import defaultAvatar from '@/public/images/no-avatar.png'

import styles from './styles.module.sass'

type SizeType = 'small' | 'medium'

interface AvatarProps {
    user?: User
    size?: SizeType
    text?: string | React.ReactNode
    loading?: boolean
    showName?: boolean
}

const getDimension = (size?: SizeType) => (size === 'medium' ? 34 : 20)

const UserAvatar: React.FC<AvatarProps> = ({ user, size, text, showName }) => {
    return (
        <div className={styles.userAvatar}>
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
                <div className={styles.info}>
                    <Link
                        href={`/users/${user.id}`}
                        title={`Профиль пользователя ${user?.name}`}
                    >
                        {user?.name}
                    </Link>
                    {text && <div>{text}</div>}
                </div>
            )}
        </div>

        // <>
        //     <Stack
        //         direction={'row'}
        //         spacing={1}
        //     >
        //         {loading ? (
        //             <>
        //                 <Skeleton
        //                     variant={'circular'}
        //                     sx={{
        //                         boxShadow: '0 0 0 1px rgba(0,0,0,.12)',
        //                         height: getDimension(size),
        //                         width: getDimension(size)
        //                     }}
        //                 />
        //                 <Skeleton
        //                     variant={'text'}
        //                     width={100}
        //                 />
        //             </>
        //         ) : (
        //             <>
        //                 <Avatar
        //                     alt={user?.name || ''}
        //                     src={
        //                         user?.avatar
        //                             ? `${IMG_HOST}avatar/${user.avatar}`
        //                             : userAvatar.src
        //                     }
        //                     sx={{
        //                         boxShadow: '0 0 0 1px rgba(0,0,0,.12)',
        //                         cursor: user?.avatar ? 'pointer' : 'default',
        //                         height: getDimension(size),
        //                         width: getDimension(size)
        //                     }}
        //                     variant={'circular'}
        //                     aria-describedby={POPOVER_ID}
        //                 />
        //                 {showName && (
        //                     <div>
        //                         {user?.id ? (
        //                             <Link
        //                                 href={`/users/${user.id}`}
        //                                 title={user?.name}
        //                             >
        //                                 {user?.name}
        //                             </Link>
        //                         ) : (
        //                             <div>{user?.name || 'Гость'}</div>
        //                         )}
        //                         {text && (
        //                             <Typography
        //                                 variant={'caption'}
        //                                 sx={{
        //                                     color: '#818c99',
        //                                     display: 'block',
        //                                     mt: '-4px'
        //                                 }}
        //                             >
        //                                 {text}
        //                             </Typography>
        //                         )}
        //                     </div>
        //                 )}
        //             </>
        //         )}
        //     </Stack>
        // </>
    )
}

export default UserAvatar
