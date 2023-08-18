const rules = require('./webpack.rules');
const {resolve} = require("path");


rules.push({
  test: /\.css$/,
  use: [{ loader: 'style-loader' }, { loader: 'css-loader' },  { loader: 'postcss-loader' }],
});

rules.push({
  test: /\.(svg|png|jpg|gif)$/,
  include: [
    resolve(__dirname, "./src/")
  ],
  type: "asset/inline",
});

module.exports = {
  // Put your normal webpack config below here
  module: {
    rules,
  },
};
