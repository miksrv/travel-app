module.exports = {
    apps: [
        {
            args: 'start',
            autorestart: true,
            env: {
                NODE_ENV: 'production'
            },
            instances: 1,
            max_memory_restart: '1G',
            name: 'geometki.com',
            script: './node_modules/next/dist/bin/next',
            watch: false
        }
    ]
}
