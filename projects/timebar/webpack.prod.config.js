var path = require('path');

module.exports = {
    entry: {
        javascript: './src/index.js'
    },
    output: {
        path: path.resolve(__dirname, 'lib'),
        filename: `index.js`,
        libraryTarget: 'commonjs2'
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loaders: ['babel-loader']
            }
        ]
    },
    externals: {
        react: 'commonjs react'
    }
};
