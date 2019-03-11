const path = require("path")
const webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

const config = {
    entry: {
        app: ['./src/index.js']
    },
    output: {
        path: path.resolve('./public/'),
        filename: 'assets/js/bundle.js',
        publicPath: '/',
        pathinfo: true,
        devtoolModuleFilenameTemplate: info =>
            path.resolve(info.absoluteResourcePath).replace(/\\/g, '/'),
    },
    devServer: {
        contentBase: 'public'
    },
    devtool: 'cheap-module-source-map',
    
    module: {
        loaders: [
            {
                test: /\.(js|jsx)$/,
                use: ['babel-loader'],
                include: path.resolve(__dirname, './src'),
            },
            {
                test: /\.png$/,
                loader: "url-loader?limit=100000"
            },
            {
                test: /\.jpg$/,
                loader: "file-loader"
            },
            {
                test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/,
                loader: 'url-loader?limit=10000&mimetype=application/font-woff&name=./assets/fonts/[hash].[ext]'
            },
            {
                test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
                loader: 'url-loader?limit=10000&mimetype=application/octet-stream&name=./assets/fonts/[hash].[ext]'
            },
            {
                test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
                loader: 'file-loader?name=./assets/fonts/[hash].[ext]'
            },
            {
                test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
                loader: 'url-loader?limit=10000&mimetype=image/svg+xml&name=./assets/fonts/[hash].[ext]'
            },
            {
                test: /\.scss$/,
                loaders: ['style-loader', 'css-loader', 'sass-loader']
            },
            {
                test: /\.csv$/,
                loader: 'dsv-loader'
            }
        ]
    },
    plugins: []
};

module.exports = function (env) {
    if (env) {
        if (env.path) {
            config.output.path = path.resolve(env.path);
        }
        if (env.production === 'true') {
            config.plugins.push(new webpack.DefinePlugin({ 'process.env.NODE_ENV': '"production"' }));
            config.plugins.push(new UglifyJsPlugin());
            process.env.NODE_ENV = 'production';
        } else {
            config.entry.app.push('webpack-dev-server/client?http://localhost:8080');
            config.entry.app.push('webpack/hot/only-dev-server');
            process.env.NODE_ENV = 'development';
        }
    }
    return config;
};
