import { useTranslation } from 'next-i18next'
import Image from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'

import Button from '@/ui/button'
import Icon from '@/ui/icon'
import Progress from '@/ui/progress'

import { IMG_HOST } from '@/api/api'
import { useAppSelector } from '@/api/store'
import { User } from '@/api/types/User'

import Header from '@/components/header'
import Reputation from '@/components/reputation'
import UserAvatarEditor from '@/components/user-avatar-editor'

import {
    formatDate,
    makeActiveLink,
    removeProtocolFromUrl,
    timeAgo
} from '@/functions/helpers'
import { levelImage, nextLevelPercentage } from '@/functions/userLevels'

import defaultAvatar from '@/public/images/no-avatar.png'

import styles from './styles.module.sass'

interface UserHeaderProps {
    user?: User
}

const UserHeader: React.FC<UserHeaderProps> = ({ user }) => {
    const { t } = useTranslation('common', {
        keyPrefix: 'components.pageUser.userHeader'
    })

    const appAuth = useAppSelector((state) => state.auth)

    const [replaceAvatar, setReplaceAvatar] = useState<string>('')

    return (
        <section className={styles.component}>
            <div className={styles.content}>
                <div>
                    <Image
                        className={styles.avatar}
                        alt={user?.name || ''}
                        priority={true}
                        height={240}
                        width={260}
                        src={
                            user?.avatar || replaceAvatar
                                ? `${IMG_HOST}${
                                      replaceAvatar
                                          ? replaceAvatar
                                          : user?.avatar
                                  }`
                                : defaultAvatar.src
                        }
                    />
                    <Progress
                        value={nextLevelPercentage(
                            user?.level?.experience || 0,
                            user?.level?.nextLevel ||
                                user?.level?.experience ||
                                0
                        )}
                    />
                </div>
                <ul className={styles.information}>
                    <li>
                        <Icon name={'Star'} />
                        <div className={styles.key}>{t('reputation')}</div>
                        <div className={styles.value}>
                            <Reputation value={user?.reputation || 0} />
                        </div>
                    </li>
                    <li>
                        <Icon name={'Award'} />
                        <div className={styles.key}>{t('level')}</div>
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
                            {t('experienceForNewLevel')}
                        </div>
                        <div className={styles.value}>
                            {(user?.level?.nextLevel || 0) -
                                (user?.level?.experience || 0)}
                        </div>
                    </li>
                    <li>
                        <Icon name={'Time'} />
                        <div className={styles.key}>
                            {t('timeRegistration')}
                        </div>
                        <div className={styles.value}>
                            {formatDate(user?.created?.date, t('dateFormat'))}
                        </div>
                    </li>
                    <li>
                        <Icon name={'Time'} />
                        <div className={styles.key}>{t('timeActivity')}</div>
                        <div className={styles.value}>
                            {timeAgo(
                                user?.activity?.date ?? user?.updated?.date
                            )}
                        </div>
                    </li>
                    <li>
                        <Icon name={'Link'} />
                        <div className={styles.key}>{t('website')}</div>
                        <div className={styles.value}>
                            {user?.website ? (
                                <Link
                                    href={makeActiveLink(user.website)}
                                    className={'external'}
                                    target={'_blank'}
                                    title={''}
                                >
                                    {removeProtocolFromUrl(user.website)}
                                </Link>
                            ) : (
                                <i>{t('notDefined')}</i>
                            )}
                        </div>
                    </li>
                </ul>
                <ul className={styles.information}>
                    <li>
                        <h3>{t('statisticActivity')}</h3>
                    </li>
                    <li>
                        <div className={styles.key}>{t('placesAdded')}</div>
                        <div className={styles.value}>
                            {user?.statistic?.place}
                        </div>
                    </li>
                    <li>
                        <div className={styles.key}>{t('photosUploaded')}</div>
                        <div className={styles.value}>
                            {user?.statistic?.photo}
                        </div>
                    </li>
                    <li>
                        <div className={styles.key}>{t('ratingsAdded')}</div>
                        <div className={styles.value}>
                            {user?.statistic?.rating}
                        </div>
                    </li>
                    <li>
                        <div className={styles.key}>{t('editions')}</div>
                        <div className={styles.value}>
                            {user?.statistic?.edit}
                        </div>
                    </li>
                    <li>
                        <div className={styles.key}>{t('covers')}</div>
                        <div className={styles.value}>
                            {user?.statistic?.cover}
                        </div>
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
                        text: t('breadCrumbUsersLink')
                    }
                ]}
                actions={
                    appAuth.isAuth &&
                    appAuth.user?.id === user?.id && (
                        <>
                            <UserAvatarEditor onSaveAvatar={setReplaceAvatar} />

                            <Button
                                size={'m'}
                                icon={'Pencil'}
                                mode={'secondary'}
                                link={'/users/settings'}
                            >
                                {t('buttonEdit')}
                            </Button>
                        </>
                    )
                }
            />
        </section>
    )
}

export default UserHeader
