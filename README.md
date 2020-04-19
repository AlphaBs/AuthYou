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
        adminPassword: 'iamadmin',
        
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


# API

### Workflow :
1. /key
2. decoding in client
3. /connect
4. /checkuser (in server)

### Common : 
URL Query `version` is used to determine client version.  
example : `/key?version=418`

All error response follow this form : 

    {
        "result": false,
        "msg": "<ERROR MESSAGE>" // can be null
    }

### POST /key
**Request body** : *(EMPTY STRING)*  
**Response** : 

    {
        "result": true,
        "version": "<ENCRYPTER VERSION>" // not equal to client version
        "psig": "<SIGNATURE>"
    }
    
 ### POST /connect
 **Request Body**: 
 
    {
        "des": "<deciphered signature>"
    }
    
**Response** :

    {
        "result": true
    }
    
### GET /checkuser
**URL Query**: `?ip=<USER_IP>`  
**Response**: `S`

### GET /reset
**Description**: Delete all rows in database.  
**URL Query**: `?pw=<Admin_Password>` *(adminPassword in config.js)*  
**Response**: `completed`  

### GET /stop
**Description**: Stop process. *(Note: This does not stop actual server, but stop one cluster of server.)*  
**URL Query**: `?pw=<Admin_Password>` *(adminPassword in config.js)*  
**Response**: `stopping`
