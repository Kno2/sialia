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
                use: [{
                    loader: 'riot-tag-loader',
                    options: {
                        enforce: 'pre',
                        type: 'none',
                        format: 'ems',
                        hot: true,
                    }
                }]
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
                use: ['style-loader', 'css-loader', 'sass-loader']
            }
        ]
    },
    devServer: {
        static: [__dirname, path.resolve(__dirname, '../docs')]
    }
}
