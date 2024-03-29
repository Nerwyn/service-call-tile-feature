const path = require('path');
const { execSync } = require('child_process');

let env =
	execSync('git branch --show-current').toString().trim() == 'main'
		? 'production'
		: 'development';
env = 'production';

module.exports = {
	mode: env,
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
	devtool: env == 'production' ? false : 'eval',
};
