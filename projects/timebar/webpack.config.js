var path = require('path');

module.exports = {
    entry: {
        javascript: './example/app.js'
    },
    output: {
        filename: `app.compiled.js`
    },
    devServer: {
        contentBase: path.join(__dirname, 'example'),
        compress: true,
        port: 9000,
        open: true
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loaders: ['babel-loader']
            }
        ]
    }
};
