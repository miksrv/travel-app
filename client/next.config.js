const { i18n } = require('./next-i18next.config.js')

/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        appDir: false
    },
    // Can be safely removed in newer versions of Next.js
    future: {
        // by default, if you customize webpack config, they switch back to version 4.
        // Looks like backward compatibility approach.
        webpack5: true
    },
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
