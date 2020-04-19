const http = require("http");
const config = require("./config/config");

const server = "127.0.0.1";
const port = config.port;
const path = "/reset";

const req = http.request({
	hostname: server,
	port: port,
	path: path
}, (res) => {
	res.on('data', (chunk) => {
		console.log(Buffer.from(chunk).toString());
	});
	res.on('end', () => {
		console.log("completed");
		process.exit();
	});
});


req.end();