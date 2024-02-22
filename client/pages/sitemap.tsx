import { GetServerSidePropsResult, NextPage } from 'next'
import React from 'react'

import { API, SITE_LINK } from '@/api/api'
import { wrapper } from '@/api/store'

type SitemapDynamicPage = {
    link: string
    update: string
}

interface SiteMapProps {}

const SiteMap: NextPage<SiteMapProps> = () => <></>

export const getServerSideProps = wrapper.getServerSideProps(
    (store) =>
        async (context): Promise<GetServerSidePropsResult<SiteMapProps>> => {
            const { data } = await store.dispatch(
                API.endpoints?.sitemapGetList.initiate()
            )

            const staticPages = ['places', 'users'].map(
                (staticPagePath) => SITE_LINK + staticPagePath
            )

            await Promise.all(store.dispatch(API.util.getRunningQueriesThunk()))

            const placesPages: SitemapDynamicPage[] =
                data?.places?.map((place) => ({
                    link: `places/${place.id}`,
                    update: new Date(place.updated.date).toISOString()
                })) || []

            const usersPages: SitemapDynamicPage[] =
                data?.places?.map((user) => ({
                    link: `users/${user.id}`,
                    update: new Date(user.updated.date).toISOString()
                })) || []

            let sitemap =
                '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'

            sitemap += staticPages
                .map(
                    (url) => `
            <url>
              <loc>${url}</loc>
              <lastmod>${new Date().toISOString()}</lastmod>
              <changefreq>monthly</changefreq>
              <priority>0.8</priority>
            </url>
          `
                )
                .join('')

            sitemap += [...placesPages, ...usersPages]
                .map(
                    (page) => `
            <url>
              <loc>${SITE_LINK + page.link}</loc>
              <lastmod>${page.update}</lastmod>
              <changefreq>daily</changefreq>
              <priority>1.0</priority>
            </url>
          `
                )
                .join('')

            sitemap += '</urlset>'

            context.res.setHeader('Content-Type', 'text/xml')
            context.res.write(sitemap)
            context.res.end()

            return {
                props: {}
            }
        }
)

export default SiteMap
