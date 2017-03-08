var webpack = require('webpack');
var path = require('path');
var fs = require('fs');

var HtmlWebpackPlugin = require('html-webpack-plugin');
var WebpackShellPlugin = require('webpack-shell-plugin');

var debug = process.env.NODE_ENV !== "production";

var APP_DIR = path.resolve(__dirname, 'src/client');
var DIST_DIR = path.resolve(__dirname, 'dist');

var SERVER_DIR = path.resolve(__dirname, 'src/server');
var BUILD_DIR = path.resolve(__dirname, 'build');


var nodeModules = {};
fs.readdirSync('node_modules')
    .filter(function(x) {
        return ['.bin'].indexOf(x) === -1;
    })
    .forEach(function(mod) {
        nodeModules[mod] = 'commonjs ' + mod;
    });

var config = [
    {
        name: 'server',
        entry: SERVER_DIR + '/server.js',
        target: 'node',
        // node: {
        //     __filename: true,
        //     __dirname: true,
        // },
        output: {
            path: BUILD_DIR,
            filename: 'server.js'
        },
        externals: nodeModules,
        module: {
            loaders : [
                {
                    test: /\.jsx?$/,
                    exclude: /(node_modules|bower_components)/,
                    loader: 'babel-loader',
                    query: {
                        "presets": ["es2017-node7"],
                    }
                }
            ]
        },
        plugins: [
            new webpack.BannerPlugin( {
                banner: 'require("source-map-support").install();',
                raw: true,
                entryOnly: false }),
            new WebpackShellPlugin({
                // onBuildStart:['echo "Webpack Start"'],
                // onBuildExit:[`node ${BUILD_DIR}/server.js`]
            })
        ],
        devtool: 'sourcemap'

    }
];

module.exports = config;
