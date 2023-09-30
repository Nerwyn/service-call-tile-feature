const path = require('path');

module.exports = {
	mode: 'production',
	entry: {
		main: './src/custom-tile-features.ts',
	},
	output: {
		path: path.resolve(__dirname, './dist'),
		filename: 'custom-tile-features.js',
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
