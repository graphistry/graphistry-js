const path = require("path");
module.exports = {
  webpack: {
    alias: {
        //https://reactjs.org/link/invalid-hook-call
        //https://github.com/facebook/react/issues/13991#issuecomment-435587809
        react: path.resolve('./node_modules/react')
    }
  }
}