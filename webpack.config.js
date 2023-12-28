const path = require('path');

module.exports = {
	mode: 'production',
	entry: {
		main: './src/service-call-tile-feature.ts',
	},
	output: {
		path: path.resolve(__dirname, './dist'),
		filename: 'service-call-tile-feature.min.js',
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
