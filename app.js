const express = require('express');
const moment = require('moment');
const encrypter = require('./encrypter');
const userdb = require('./userdb');
const config = require('./config/config');

const app = express();
const enc = new encrypter.Encrypter();
const db = new userdb.UserDB(config.dbconfig);

let server;

function fail(msg) {
    let failObj = {
        result: false
    }

    if (config.showErrorMsg) {
        if (msg instanceof Error)
            failObj["msg"] = msg.message;
        else
            failObj["msg"] = msg;
    }

    return failObj;
}

app.use((req, res, next) => {
    let version = req.query.version;
    if (version == undefined)
        version = "X"

    console.log(`${req.connection.remoteAddress} [${version}] : ${req.path}`);
    next();
});

app.use(express.json({ limit: '1kb' }));

app.post('/key', async (req, res) => {
    try {
        let encdata = await enc.getEncData(req.connection.remoteAddress);
        let exp = moment().add(config.userExpireM, 'minutes');

        await db.addUserData(
            req.connection.remoteAddress,
            encdata.decsig,
            exp
        );

        res.json({
            result: true,
            version: enc.version,
            psig: encdata.psig
        });
    }
    catch (e) {
        console.log(`key failed ${e.message}`);
        res.send(fail(e));
    }
});

app.post('/connect', async (req, res) => {
    let userdata = undefined;
    let ip = req.connection.remoteAddress;

    try {
        let des = req.body.des; // hex

        if (!des)
            throw new Error('bad request');

        let rows = await db.getUserData(ip);
        if (!rows || rows.length === 0)
            throw new Error('no user');

        userdata = rows[0];
        if (moment().isAfter(userdata.expire_date))
            throw new Error('expired');

        let decrypted = await enc.getDecData(des, userdata.private_key);
        if (decrypted !== userdata.signature)
            throw new Error('not equal signature');

        //await db.deleteUserData(uuid);
        let exp = moment().add(config.allowExpireS, 'seconds');
        await db.allowUser(ip, exp);

        res.send({
            result: true
        });

    } catch (e) {
        if (userdata)
            await db.deleteUserData(userdata.req_ip);

        console.log(`connect failed ${ip} : ${e.message}`);
        res.send(fail(e));
    }
});

app.get('/checkuser', async (req, res) => {
    let ip = "";
    let userdata = undefined;

    try {
        ip = req.query.ip;
        if (ip.includes(':'))
            ip = ip.split(':')[0].replace(/\//gi, "");

        if (ip === "127.0.0.1" || ip === "192.168.0.1") {
            res.send('S');
            return;
        }

        if (!ip)
            throw new Error('bad request');

        let rows = await db.checkUser(ip);
        if (!rows || rows.length == 0)
            throw new Error('no user');

        userdata = rows[0];

        if (moment().isAfter(userdata.expire_date))
            throw new Error('expired');

        console.log("allow " + ip);
        await db.removeAllowingUser(ip);
        res.send('S');
    }
    catch (e) {
        if (userdata)
            await db.removeAllowingUser(ip);

        console.log(`checkuser failed ${ip} : ${e.message}`);
        res.send(fail(e));
    }
});

async function resetDb() {
    console.log("start db reset");
    await db.deleteAllAllowingUser();
    await db.deleteAllWaitingUser();
    console.log("end db reset");
}

app.get('/reset', async (req, res) => {
    try {
        await resetDb();
        res.send("completed");
    }
    catch (e) {
        console.log("reset fail");
        console.log(e);
        res.send(fail(e));
    }
});

async function stopServer() {
    await db.end();
    server.close();

    console.log("stop server");
    process.exit();
}

app.get('/version', async (req, res) => {
    try {
        res.send(config.launcher_version);
    }
    catch (e) {
        console.log(e);
        res.send(fail(e));
    }
});

app.get('/stop', async (req, res) => {
    try {
        let pw = req.query.pw;
        if (!pw)
            throw new Error('not equal password');
        if (pw !== config.stopPassword)
            throw new Error('not equal password');

        res.send('stopping');

        await stopServer();
    }
    catch (e) {
        console.log(e.message);
        res.send(fail(e));
    }
})

app.get('/S', async (req, res) => {
    try {
        res.send("S");
    }
    catch (e) {
        res.send(fail(e));
    }
});

process.on('SIGINT', function () {
    stopServer();
})

async function init() {
    await db.test();

    server = app.listen(config.port, config.host, () => {
        console.log('server started');

        try {
            process.send('ready'); // pm2
        } catch (e) {
            console.log(e);
        }
    });
}

init();