var path = require('path');
var webpack = require('webpack');
//var {InjectManifest} = require('workbox-webpack-plugin');

module.exports = {
	entry: {
		'home': './public/src/js/main/Home/index.js',
		'skill-query': './public/src/js/main/SkillQuery/index.js',
		'item-query': './public/src/js/main/ItemQuery/index.js',
		'enchant-simulator': './public/src/js/main/EnchantSimulator/index.js',
		'damage-calculation': './public/src/js/main/DamageCalculation/index.js'
	},
	output: {
		path: path.join(__dirname, '/public/dist'),
		filename: '[name].min.js'
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: ['@babel/preset-env']
					}
				}
			}
		]
	}
	// plugins: [
	// 	new InjectManifest({
	// 		swDest: 'service-worker.js',
	// 		swSrc: 'workbox-config.js'
	// 	})
	// ]
};