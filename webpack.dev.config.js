var path = require('path');
var webpack = require('webpack');

const VueLoaderPlugin = require('vue-loader/lib/plugin');

module.exports = {
    entry: {
        'home': './src/js/main/Home/index.js',
        'skill-query': './src/js/main/SkillQuery/index.js',
        'item-query': './src/js/main/ItemQuery/index.js',
        'enchant-simulator': './src/js/main/EnchantSimulator/index.js',
        'damage-calculation': './src/js/main/DamageCalculation/index.js',
        'skill-simulator': './src/js/main/SkillSimulator/index.js'
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
    devtool: 'cheap-eval-source-map',
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
                test: /\.(woff|woff2|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[name].[ext]'
                        }
                    }
                ]
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
            'vue': path.join(__dirname, 'src', 'js', 'main', 'module', 'Plugin', 'vue.esm.browser.js'),
            'global-vue-components': path.join(__dirname, 'src', 'js', 'main', 'module', 'vue'),
            'global-modules': path.join(__dirname, 'src', 'js', 'main', 'module'),
            '@css': path.join(__dirname, 'src', 'css')
        }
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new VueLoaderPlugin()
    ]
};