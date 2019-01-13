let path = require('path');

module.exports = {
	entry: ['./js/index.jsx'],
	output: {
		path: path.join(__dirname, 'dist'),
		filename: 'index.js'
	},
	devServer: {
		contentBase: './dist',
		hot: true
	}
};
