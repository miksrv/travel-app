import { useTranslation } from 'next-i18next'
import Image from 'next/image'
import React from 'react'

import Container, { ContainerProps } from '@/ui/container'
import Progress from '@/ui/progress'

import { User } from '@/api/types/User'

import Reputation from '@/components/reputation'
import UserAvatar from '@/components/user-avatar'
import styles from '@/components/users-list/styles.module.sass'

import { levelImage, nextLevelPercentage } from '@/functions/userLevels'

interface UsersListProps extends Pick<ContainerProps, 'title' | 'footer'> {
    users?: User[]
}

const UsersList: React.FC<UsersListProps> = ({ users, ...props }) => {
    const { t } = useTranslation('common', {
        keyPrefix: 'components.userList'
    })

    return users?.length ? (
        <Container {...props}>
            {users.map((user) => (
                <section
                    key={user.id}
                    className={styles.usersListItem}
                >
                    <UserAvatar
                        className={styles.avatar}
                        showName={true}
                        user={user}
                        size={'medium'}
                        caption={
                            <>
                                <Image
                                    className={styles.levelImage}
                                    src={levelImage(user?.level?.level)?.src}
                                    alt={''}
                                    width={16}
                                    height={16}
                                />
                                {user?.level?.level} {t('level')}
                            </>
                        }
                    />

                    <div className={styles.reputation}>
                        <noindex>
                            <p>{`${t('reputation')}: `}</p>
                        </noindex>
                        <Reputation value={user?.reputation || 0} />
                    </div>

                    <div className={styles.level}>
                        <noindex>
                            <p>{user?.level?.title}</p>
                        </noindex>
                        <Progress
                            className={styles.progress}
                            value={nextLevelPercentage(
                                user?.level?.experience || 0,
                                user?.level?.nextLevel ||
                                    user?.level?.experience ||
                                    0
                            )}
                        />
                    </div>
                </section>
            ))}
        </Container>
    ) : (
        <Container className={styles.emptyList}>{t('emptyList')}</Container>
    )
}

export default UsersList
