const config = {
	/**
	 * This is the main entry point for your application, it's the first file
	 * that runs in the main process.
	 */
	entry: './src/main.js',
	// Put your normal webpack config below here
	module: {
		rules: require('./webpack.rules'),
	},
	dependencies: ['better-sqlite3']
};

if(process.env.NODE_ENV === "development")
	config.externals = {
		'better-sqlite3': true
	}

module.exports = config;