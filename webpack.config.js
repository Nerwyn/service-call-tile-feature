const path = require('path');

module.exports = {
	mode: 'production',
	entry: {
		main: './src/service-call-tile-features.ts',
	},
	output: {
		path: path.resolve(__dirname, './dist'),
		filename: 'service-call-tile-feature.js',
	},
	resolve: {
		extensions: ['.ts', '.tsx', '.js'],
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				loader: 'ts-loader',
			},
		],
	},
};
