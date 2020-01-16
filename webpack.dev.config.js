var path = require('path');
var webpack = require('webpack');
//var {InjectManifest} = require('workbox-webpack-plugin');

const VueLoaderPlugin = require('vue-loader/lib/plugin')

module.exports = {
    entry: {
        'home': './public/src/js/main/Home/index.js',
        'skill-query': './public/src/js/main/SkillQuery/index.js',
        'item-query': './public/src/js/main/ItemQuery/index.js',
        'enchant-simulator': './public/src/js/main/EnchantSimulator/index.js',
        'damage-calculation': './public/src/js/main/DamageCalculation/index.js',
        'skill-simulator': './public/src/js/main/SkillSimulator/index.js'
    },
    output: {
        path: path.join(__dirname, 'public', 'dist'),
        filename: '[name].min.js'
    },
    devServer: {
        contentBase: './public',
        hot: true,
        inline: true
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
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.less$/,
                use: ['style-loader', 'css-loader', 'less-loader']
            },
            {
                test: /\.vue$/,
                use: {
                    loader: 'vue-loader'
                }
            }
        ]
    },
    resolve: {
        alias: {
            'vue': path.join(__dirname, 'public', 'src', 'js', 'main', 'module', 'Plugin', 'vue.esm.browser.js'),
            'global-vue-components': path.join(__dirname, 'public', 'src', 'js', 'main', 'module', 'vue'),
            'global-modules': path.join(__dirname, 'public', 'src', 'js', 'main', 'module')
        }
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new VueLoaderPlugin()
    ]
};