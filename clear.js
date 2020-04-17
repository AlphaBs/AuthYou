const http = require("http");

const server = "127.0.0.1:25588";
const path = "/reset";

http.request({
	hostname: server,
	path: path
}, (res) => {
	console.log(res);
	console.log("completed");
	process.exit();
});