var path = require('path');
var webpack = require('webpack');
//var {InjectManifest} = require('workbox-webpack-plugin');

module.exports = {
	entry: {
		'home': './src/js/main/Home/index.js',
		'skill-query': './src/js/main/SkillQuery/index.js',
		'item-query': './src/js/main/ItemQuery/index.js',
		'enchant-simulator': './src/js/main/EnchantSimulator/index.js',
		'damage-calculation': './src/js/main/DamageCalculation/index.js'
	},
	output: {
		path: path.join(__dirname, 'dist'),
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