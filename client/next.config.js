const { i18n } = require('./next-i18next.config.js')

/** @type {import('next').NextConfig} */
const nextConfig = {
    i18n,
    // unoptimized - When true, the source image will be served as-is instead of changing quality,
    // size, or format. Defaults to false.
    images: {
        unoptimized: true
    },
    transpilePackages: [
        '@mdxeditor/editor',
        'react-diff-view',
        'leaflet',
        'leaflet-defaulticon-compatibility',
        'leaflet-geosearch'
    ],

    webpack(config) {
        config.resolve.fallback = {
            // if you miss it, all the other options in fallback, specified
            // by next.js will be dropped.
            ...config.resolve.fallback,

            fs: false // the solution
        }

        return config
    }
}

module.exports = nextConfig
