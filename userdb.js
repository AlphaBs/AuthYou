
const mysql = require('mysql');

function momentEscape(e) {
    return e.format('YYYYMMDDHHmmss');
}

class UserDB {
    constructor(conf) {
        this.db = mysql.createConnection(conf);
        this.db.connect();
    }

    request(sql) {
        return new Promise((resolve, reject) => {
            this.db.query(sql, (err, rows) => {
                if (err)
                    reject(err);

                resolve(rows);
            });
        });
    }

    async test() {
        return await this.request(`
        DESCRIBE waiting_users
        `);
    }

    async addUserData(reqIp, sig, expire) {
        let expstr = momentEscape(expire);
		let eReqIp = this.db.escape(reqIp);
		let eSig = this.db.escape(sig);
		
        let q =
            `
        REPLACE INTO waiting_users
        VALUES (${eReqIp}, ${eSig}, ${expstr})
        `;

        await this.request(q);
    }

    async getUserData(ip) {
		let eIp = this.db.escape(ip);
        let q =
            `
        SELECT * FROM waiting_users
        WHERE req_ip=${eIp}
        `;

        return await this.request(q);
    }

    async deleteUserData(ip) {
		let eIp = this.db.escape(ip);
        let q =
            `
        DELETE FROM waiting_users
        WHERE req_ip=${eIp}
        `;

        return await this.request(q);
    }

    async allowUser(ip, exp) {
		let eIp = this.db.escape(ip);
        let expEscape = momentEscape(exp);
        let q =
            `
        REPLACE INTO allowing_users
        VALUES (${eIp}, ${expEscape})
        `;

        return await this.request(q);
    }

    async checkUser(ip) {
		let eIp = this.db.escape(ip);
        let q =
            `  
            SELECT * FROM allowing_users
            WHERE req_ip=${eIp}
        `;

        return await this.request(q);
    }
	
	async removeAllowingUser(ip) {
		let eIp = this.db.escape(ip);
		let q =
            `
            DELETE FROM allowing_users
            WHERE req_ip=${eIp}
    `;

        return await this.request(q);
    }
	
	async deleteAllAllowingUser() {
		let q = 
			`
			DELETE FROM allowing_users
			WHERE TRUE
		`;
		
		return await this.request(q);
	}
	
	async deleteAllWaitingUser() {
		let q = 
			`
			DELETE FROM waiting_users
			WHERE TRUE
		`;
		
		return await this.request(q);
	}
	
	async end() {
		return new Promise((resolve, reject) => {
            this.db.end(() => {
                resolve();
            });
        });
	}
}

module.exports = {
    UserDB: UserDB
}