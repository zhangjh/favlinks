const other = {};
const request = require("request");

function getData(url, cb) {
	const options = {
		headers: {
			accept: 'application/json'
		}
	};
	let result = {};
	request.get(url, options, (e, r, body) => {
		if(e) {
			result = {status: 1, msg: "error:" + e};	
			if(cb) cb(result);
		}
		const bodyJson = JSON.parse(body);
		const code = bodyJson.code;
		const data = bodyJson.data;
		if(code != 0) {
			result = {status: 1, msg: bodyJson.msg};
			if(cb) cb(result);
		}
		result = {status: 0, data: data};
		if(cb) cb(result);
	});
}

other.getTiangou = function() {
	return function(req, res) {
		const url = "https://api.wangpinpin.com/unAuth/getDoglickingDiary?typeId=0c97d296-e5b1-11ea-9d4b-00163e1e93a5";
		const result = getData(url, (result) => {
			res.json(result);
		});
	};
};

other.getWuwuwu = function() {
	return function(req, res) {
		const url = "https://api.wangpinpin.com/unAuth/getDoglickingDiary?typeId=485eee9c-e603-11ea-9d4b-00163e1e93a5";
		const result = getData(url, (result) => {
			res.json(result);
		});
	};
};

module.exports = other;
