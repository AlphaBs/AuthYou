
let uuid = "156CB35728394D55B7DC31E95670AE5E";

function GetHexVal(hex) {
    var val = Number(hex);
    return val - (val < 58 ? 48 : (val < 97 ? 55 : 87));
}

class Encrypter {
    constructor() {
        this.version = "b1.0";
    }

    randomString(string_length) {
        var chars = "0123456789abcdef";
        var charlength = chars.length;
        var randomstring = '';
        for (var i = 0; i < string_length; i++) {
            var rnum = Math.floor(Math.random() * charlength);
            randomstring += chars.substring(rnum, rnum + 1);
        }
        return randomstring;
    }

    getEncData(ip) {
        let sig = this.randomString(10);
        let encd = this.encData(sig, uuid);

        return {
            decsig: encd,
            psig: sig
        }
    }

    encData(sig, uuid) {
        let buffer = Buffer.alloc(1024);
        let length = 0;

        let uuidbuffer = Buffer.from(uuid, 'utf8');
        buffer[length] = uuidbuffer.length;
        length++;

        for (let i = 0; i < uuidbuffer.length; i++) {
            buffer[length + i] = uuidbuffer[i]
        }
        length += uuidbuffer.length;

        var sigBuffer = Buffer.from(sig, 'hex');
        var ckey = "a=WYZVKgn0j8Tr6U9ctlIzgxPmcGcQHAt;"; // 34 length
        var clength = 34;
        var sigbyte = Buffer.alloc(sig.length >> 1); // sig to byte

        for (var i = 0; i < sig.length >> 1; ++i) {
            var hexed = sigBuffer[i];
            var keyv = ckey.charCodeAt(hexed >> 3);
            sigbyte[i] = keyv;
            buffer[length + i] = sigbyte[i];
        }
        length += sigbyte.length;

        let salt = Buffer.from(ckey.substr(sigbyte[2] >> 5, 12), 'utf8');
        for (let i = 0; i < salt.length; i++) {
            buffer[length + i] = salt[i];
        }
        length += salt.length;

        return buffer.toString('hex', 0, length);
    }

    getDecData(sig, key) {
        return sig;
    }
}

module.exports = {
    Encrypter: Encrypter
}