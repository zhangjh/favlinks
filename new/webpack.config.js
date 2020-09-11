const path = require('path');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const HtmlWebPackPlugin = require("html-webpack-plugin");

module.exports = {
	entry: {
        'js/index': './src/js/index.jsx',
		'css/index': './src/css/index.css',
		'assets/fonts/FZLongZhaoJW': './src/assets/fonts/FZLongZhaoJW.ttf',
		'assets/fonts/sxdxt': './src/assets/fonts/sxdxt.ttf',
    },
	output: {
		path: path.resolve(__dirname, '../public/new/'),
		filename: '[name].bundle.js'
	},
	/*devServer: {
		contentBase: './dist',
		hot: true
	},*/
    module: {
        rules: [
            {
                test: /\.html$/,
                use: [
                    'html-loader',
                ]
            },
            {
                test: /\.css$/,
                use: [
					'style-loader',
					'css-loader',
				],
                include: [
                    path.join(__dirname, 'src'),
                    path.join(__dirname, '/node_modules/antd')
                ]
            },
            {
                test: /\.(png|svg|jpg|gif)$/,
                use: [
                    'file-loader',
                ]
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/,
                use: [{
                    loader: 'file-loader',
					options: {
						name: 'assets/fonts/[name].[ext]'
					}
                }]
            },
            {
                test: /\.js|jsx$/,
                use: [
                    'babel-loader',
                ],
                exclude: '/node_modules/'
            }
        ]
    },
    plugins: [
        new ExtractTextPlugin('styles.css'),
        new HtmlWebPackPlugin({
            template: "./src/index.html",
            fileName: "./index.html"
        })
    ]
};
