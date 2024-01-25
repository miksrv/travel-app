import Image from 'next/image'
import React from 'react'

import Button from '@/ui/button'
import Icon from '@/ui/icon'
import Progress from '@/ui/progress'

import { IMG_HOST } from '@/api/api'
import { User } from '@/api/types/User'

import Header from '@/components/header'
import Reputation from '@/components/reputation'

import { formatDate } from '@/functions/helpers'
import { levelImage, nextLevelPercentage } from '@/functions/userLevels'

import defaultAvatar from '@/public/images/no-avatar.png'

import styles from './styles.module.sass'

interface UserHeaderProps {
    user?: User
}

const UserHeader: React.FC<UserHeaderProps> = ({ user }) => (
    <section className={styles.component}>
        <div className={styles.content}>
            <div>
                <Image
                    className={styles.avatar}
                    alt={user?.name || ''}
                    height={160}
                    width={160}
                    src={
                        user?.avatar
                            ? `${IMG_HOST}avatar/${user.avatar}`
                            : defaultAvatar.src
                    }
                />
                <Progress
                    value={nextLevelPercentage(
                        user?.level?.experience || 0,
                        user?.level?.nextLevel || user?.level?.experience || 0
                    )}
                />
            </div>
            <ul className={styles.information}>
                <li>
                    <Icon name={'Star'} />
                    <div className={styles.key}>{'Репутация:'}</div>
                    <div className={styles.value}>
                        <Reputation value={user?.reputation || 0} />
                    </div>
                </li>
                <li>
                    <Icon name={'Award'} />
                    <div className={styles.key}>{'Уровень:'}</div>
                    <div className={styles.value}>
                        [<b>{user?.level?.level}</b>]{' '}
                        <Image
                            className={styles.levelImage}
                            src={levelImage(user?.level?.level)?.src}
                            alt={''}
                            width={20}
                            height={20}
                        />{' '}
                        {user?.level?.title}
                    </div>
                </li>
                <li>
                    <Icon name={'DoubleUp'} />
                    <div className={styles.key}>
                        {'Опыта до нового уровня:'}
                    </div>
                    <div className={styles.value}>
                        {(user?.level?.nextLevel || 0) -
                            (user?.level?.experience || 0)}
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
                <li>
                    <Icon name={'Link'} />
                    <div className={styles.key}>{'Личная страница:'}</div>
                    <div className={styles.value}>
                        {user?.website ? user.website : <i>Не указана</i>}
                    </div>
                </li>
            </ul>
            <ul className={styles.information}>
                <li>
                    <h3>{'Статистика активности'}</h3>
                </li>
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
        <Header
            title={user?.name}
            currentPage={user?.name}
            attachedBottom={true}
            links={[
                {
                    link: '/users/',
                    text: 'Путешественники'
                }
            ]}
            actions={
                <Button
                    size={'m'}
                    icon={'Pencil'}
                    mode={'primary'}
                >
                    {'Редактировать'}
                </Button>
            }
        />
    </section>
)

export default UserHeader