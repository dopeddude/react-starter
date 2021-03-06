var path = require("path");
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var LiveReloadPlugin = require("webpack-livereload-plugin");
var CopyWebpackPlugin = require("copy-webpack-plugin");
var webpack = require("webpack");
var appExtractTextPlugin = new ExtractTextPlugin({
	filename: "app.css",
	disable: false,
	allChunks: true
});

var baseConfig = {
	entry: {
		bundle: ["babel-polyfill", "./src/index"]
	},
	output: {
		path: path.join(__dirname, "dist"),
		filename: "[name].js"
	},
	plugins: [
		appExtractTextPlugin,
		new webpack.LoaderOptionsPlugin({
			options: {
				"if-loader": process.env.NODE_ENV === "production" ? "production" : "dev",
				debug: process.env.NODE_ENV !== "production"
			}
		}),
		new CopyWebpackPlugin([
			{from: "src/index.html"}])
	],
	module: {
		rules: [
			{
				test: /.jsx?$/,
				exclude: /node_modules/,
				use: [{
					loader: "babel-loader",
					options: {
						presets: [
							["es2015", {loose: true, modules: false}],
							["react"],
							["stage-0"]
						],
						plugins: [
							["transform-object-rest-spread"]
						]
					}
				}, {
					loader: "if-loader"
				}]
			},
			{
				test: /\.css$/,
				exclude: [/node_modules/],
				loader: appExtractTextPlugin.extract({
					//fallback: "style-loader",
					use: [{
						loader: "css-loader",
						options: {
							modules: true,
							importLoaders: 1,
							localIdentName: "[name]__[local]___[hash:base64:5]",
							sourceMap: true
						}
					}, {
						loader: "postcss-loader"
					}]
				})
			},
			{
				test: /\.css$/,
				include: [/node_modules/],
				use: appExtractTextPlugin.extract({
					//fallback: "style-loader",
					use: "css-loader",
					publicPath: "/dist"
				})
			},
			{
				test: /\.xml$/,
				loader: "raw-loader"
			},
			{
				test: /\.(woff|woff2|ttf|eot|svg|ico|gif|png)(\?v=[a-z0-9]\.[a-z0-9]\.[a-z0-9])?$/,
				use: "url-loader?limit=100000"
			},
			{
				include: /\.json$/,
				use: {
					loader: "json-loader"
				}
			},
			{
				test: /\.(jpg)$/,
				use: [
					{
						loader: "file-loader",
						options: {}
					}
				]
			}
		]
	}
};
if (process.env.NODE_ENV === "production") {
	baseConfig.cache = false;
	baseConfig.plugins.push(new webpack.optimize.UglifyJsPlugin({
		compress: false,
		sourceMap: false
	}));
} else {
	baseConfig.plugins.push(new LiveReloadPlugin({
		port: 36000
	}));
	baseConfig.cache = true;
	baseConfig.devtool = "inline-source-map";
}

module.exports = baseConfig;
