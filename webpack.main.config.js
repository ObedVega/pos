const rules = require("./webpack.rules");

rules.push({
  test: /\.sql$/,
  type: "asset/source",
});

module.exports = {
  entry: "./src/main.js",

  module: {
    rules,
  },

  resolve: {
    extensions: [".js", ".json"],
  },
};