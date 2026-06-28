import React from 'react'
import { Button, Icon } from 'simple-react-ui-kit'

import { useTranslation } from 'next-i18next/pages'

import { ApiType } from '@/api'

import styles from './styles.module.sass'

interface MapHeroProps {
    stats?: ApiType.Stats.GetResponse
}

type StatKey = keyof ApiType.Stats.GetResponse

const STAT_ITEMS: Array<{ icon: string; key: StatKey; labelKey: string }> = [
    { icon: 'Point', key: 'places', labelKey: 'hero-stat-places' },
    { icon: 'Users', key: 'users', labelKey: 'hero-stat-users' },
    { icon: 'Camera', key: 'photos', labelKey: 'hero-stat-photos' },
    { icon: 'StarEmpty', key: 'reviews', labelKey: 'hero-stat-reviews' }
]

const formatNumber = (n: number): string => n.toLocaleString('ru-RU')

export const MapHero: React.FC<MapHeroProps> = ({ stats }) => {
    const { t } = useTranslation()

    return (
        <section className={styles.hero}>
            <div
                className={styles.heroBackdrop}
                aria-hidden={'true'}
            />

            <div className={styles.heroContent}>
                <h1 className={styles.heroTitle}>{t('hero-title')}</h1>
                <p className={styles.heroSubtitle}>{t('hero-subtitle')}</p>
                <p className={styles.heroDescription}>{t('hero-description')}</p>

                <div className={styles.heroActions}>
                    <Button
                        mode={'primary'}
                        size={'large'}
                        link={'/places/create'}
                    >
                        {t('hero-cta-add')}
                        <Icon name={'PlusCircle'} />
                    </Button>
                    <Button
                        mode={'secondary'}
                        size={'large'}
                        link={'/map'}
                    >
                        {t('hero-cta-explore')}
                        <Icon name={'Compass'} />
                    </Button>
                </div>

                <div className={styles.heroStats}>
                    {STAT_ITEMS.map(({ icon, key, labelKey }) => (
                        <div
                            key={key}
                            className={styles.statItem}
                        >
                            <div className={styles.statIcon}>
                                <Icon name={icon as Parameters<typeof Icon>[0]['name']} />
                            </div>
                            <div className={styles.statText}>
                                <span className={styles.statValue}>{stats ? formatNumber(stats[key]) : '—'}</span>
                                <span className={styles.statLabel}>{t(labelKey)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
