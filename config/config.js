module.exports = {
    production: {},
    development: {
        database: {
            login: 'admin',
            password: '123456',
            name: 'Blog',
            options: {
                host: 'RUKAVITSINI',
                port: 1555,
                dialect: 'mssql'
            }
        },
        cache: {
            shouldBeUsed: true
        }
    }
};

// exports.get = function get(env) {
//     return config[env] || config.development;
// }