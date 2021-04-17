import path from 'path';
import ExtractTextPlugin from 'extract-text-webpack-plugin';

const externals = {
    bluebutton: 'bluebutton',
    bootstrap: 'bootstrap',
    dragula: 'dragula',
    jquery: 'jquery',
    lodash: 'lodash',
    moment: 'moment',
    riot: 'riot'
};

const extractCss = new ExtractTextPlugin({
    filename: '[name].css'
});

export default {
    entry: {
        'sialia': './src/index.ts'
    },
    devtool: 'source-map',
    externals: externals,
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',
        library: 'sialia',
        libraryTarget: 'umd'
    },
    optimization: {
        minimize: false,
    },
    resolve: {
        extensions: ['.scss', '.ts', '.tsx', '.js']
    },
    plugins: [
        extractCss
    ],
    module: {
        rules: [
            {
                test: /\.tag$/,
                loader: 'riot-tag-loader',
                enforce: 'pre',
                query: {
                    type: 'none',
                    format: 'ems'
                }
            },
            {
                test: /\.ts(x?)$/,
                exclude: /node_modules/,
                use: 'ts-loader',
            },
            {
                test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
                loader: 'url-loader',
                exclude: /dist/
            },
            {
                test: /\.scss$/,
                exclude: /dist/,
                use: extractCss.extract({
                    use: [
                        {
                            loader: 'css-loader',
                            options: {
                                importLoaders: 1
                            }
                        },
                        {
                            loader: 'postcss-loader'
                        },
                        { loader: 'sass-loader' }
                    ],
                    fallback: 'style-loader'
                }),
            }
        ]
    }
};
