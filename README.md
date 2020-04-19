# AuthYou
Authenticate the user

# Install
### 1. clone this repository and run these commands in terminal

    npm i express moment
    npm i -g pm2
    
### 2. create `logs` and `config` directory in this repository and create config.js file in config directory.  

config.js : 


    module.exports = {
        host: "0.0.0.0",
        port: 25588,
        
        userExpireM: 10,
        allowExpireS: 40,
        showErrorMsg: false,
        stopPassword: 'stoppw1324',
        
        dbconfig: {
            host: 'mysql_server_host',
            user: 'username',
            password: 'password',
            database: 'dbname',
            insecureAuth: true
        },

        launcher_version: "418"
    }
    
direcotry structure is like this : 

    AuthYou
     |-config
     |   |-config.js
     |-logs
     |   |-< empty dir >
     |-app.js
     |-ecosystem.config.js
     |-encrypter.js
     |-reset.js
     |-reset.bat
     |-userdb.js
     
### 3. Install MySQL and create 2 tables :   
 
    CREATE TABLE `allowing_users` (
      `req_ip` varchar(15) NOT NULL,
      `expire_date` timestamp NOT NULL,
      PRIMARY KEY (`req_ip`),
      UNIQUE KEY `allowing_users_req_ip_uindex` (`req_ip`)
    )

,

    CREATE TABLE `waiting_users` (
     `req_ip` varchar(15) NOT NULL,
     `signature` text,
     `expire_date` timestamp NOT NULL,
     PRIMARY KEY (`req_ip`),
     UNIQUE KEY `allowing_users_req_ip_uindex` (`req_ip`)
    )
    
### 4. Start server

run this command in `AuthYou` directory via PowerShell : 

    pm2 start .\ecosystem.config.js
    pm2 monit
    
end
