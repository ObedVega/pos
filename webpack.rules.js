module.exports = [
  {
    test: /\.(js|jsx)$/,
    exclude: /(node_modules|\.webpack)/,
    use: {
      loader: "babel-loader",
    },
  },
];