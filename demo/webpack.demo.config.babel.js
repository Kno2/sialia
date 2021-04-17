import path from 'path';

export default {
    mode: 'development',
    entry: {
        'demo': path.join(__dirname, './demo.ts')
    },
    resolve: {
        extensions: ['.scss', '.ts', '.tsx', '.js']
    },
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
                use: [{
                    loader: 'style-loader'
                }, {
                    loader: 'css-loader'
                }, {
                    loader: 'sass-loader'
                }]
            }
        ]
    },
    devServer: {
        contentBase: [__dirname, path.resolve(__dirname, '../docs')]
    }
}
