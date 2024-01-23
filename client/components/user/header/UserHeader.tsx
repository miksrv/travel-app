import Image from 'next/image'
import React from 'react'

import Breadcrumbs, { BreadcrumbLink } from '@/ui/breadcrumbs/Breadcrumbs'
import Button from '@/ui/button'
import Icon from '@/ui/icon'

import { IMG_HOST } from '@/api/api'
import { User } from '@/api/types/User'

import Reputation from '@/components/reputation'

import { formatDate } from '@/functions/helpers'

import defaultAvatar from '@/public/images/no-avatar.png'

import styles from './styles.module.sass'

interface UserHeaderProps {
    user?: User
    breadcrumbs?: BreadcrumbLink[]
}

const UserHeader: React.FC<UserHeaderProps> = ({ breadcrumbs, user }) => (
    <section className={styles.component}>
        <div className={styles.content}>
            <Image
                className={styles.avatar}
                alt={user?.name || ''}
                height={150}
                width={150}
                src={
                    user?.avatar
                        ? `${IMG_HOST}avatar/${user.avatar}`
                        : defaultAvatar.src
                }
            />
            <ul className={styles.information}>
                <li>
                    <Icon name={'Star'} />
                    <div className={styles.key}>{'Репутация:'}</div>
                    <div className={styles.value}>
                        <Reputation value={user?.reputation || 0} />
                    </div>
                </li>
                <li>
                    <Icon name={'Time'} />
                    <div className={styles.key}>{'Регистрация:'}</div>
                    <div className={styles.value}>
                        {formatDate(user?.created?.date)}
                    </div>
                </li>
                <li>
                    <Icon name={'Time'} />
                    <div className={styles.key}>{'Был(а) тут:'}</div>
                    <div className={styles.value}>
                        {formatDate(user?.updated?.date)}
                    </div>
                </li>
            </ul>
            <ul className={styles.information}>
                <li>
                    <div className={styles.key}>{'Добавлено мест:'}</div>
                    <div className={styles.value}>
                        {user?.statistic?.places}
                    </div>
                </li>
                <li>
                    <div className={styles.key}>{'Загружено фотографий:'}</div>
                    <div className={styles.value}>
                        {user?.statistic?.photos}
                    </div>
                </li>
                <li>
                    <div className={styles.key}>{'Поставлено оценок:'}</div>
                    <div className={styles.value}>
                        {user?.statistic?.rating}
                    </div>
                </li>
                <li>
                    <div className={styles.key}>{'Редактирований:'}</div>
                    <div className={styles.value}>{user?.statistic?.edit}</div>
                </li>
            </ul>
        </div>
        <header className={styles.header}>
            <div>
                <h1>{user?.name}</h1>
                <Breadcrumbs
                    currentPage={user?.name}
                    links={breadcrumbs}
                />
            </div>
            <div className={styles.actions}>
                <Button
                    icon={'EditLocation'}
                    mode={'primary'}
                >
                    {'Настроить'}
                </Button>
            </div>
        </header>
    </section>
)

export default UserHeader
