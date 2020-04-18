// put this config file to config/config.js

module.exports = {
    host: "0.0.0.0",
    port: 25599,

    userExpireM: 2,
    allowExpireS: 40,
    showErrorMsg: true,
    stopPassword: '1234',

    dbconfig: {
        host: '127.0.0.1',
        user: 'username',
        password: 'password',
        database: 'database_name',
        insecureAuth: true
    }
}