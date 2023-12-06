module.exports = {
	packagerConfig: {
		asar: true,
		extraResource: ["./src/app/static/"]
	},
	rebuildConfig: {},
	makers: [
		{
			name: '@electron-forge/maker-squirrel',
			config: {},
		},
		{
			name: '@electron-forge/maker-zip',
			platforms: ['darwin'],
		},
		{
			name: '@electron-forge/maker-deb',
			config: {},
		},
		{
			name: '@electron-forge/maker-rpm',
			config: {},
		},
		{
			name: "@electron-forge/maker-dmg",
			config: {
				background: "./src/static/img/electron.png",
				format: "ULFO"
			}
		}
	],
	plugins: [
		{
			name: '@electron-forge/plugin-auto-unpack-natives',
			config: {},
		},
		{
			name: '@electron-forge/plugin-webpack',
			config: {
				mainConfig: './webpack.main.config.js',
				renderer: {
					config: './webpack.renderer.config.js',
					entryPoints: [
						{
							html: './src/app/index.html',
							js: './src/app/index.jsx',
							name: 'main_window',
							preload: {
								js: './src/preload.js',
							},
						},
					],
				},
			},
		},
	],
	publishers: [
		{
			name: '@electron-forge/publisher-github',
			config: {
				repository: {
					owner: 'ishwarjagdale',
					name: 'reactron-project'
				},
				prerelease: true
			}
		}
	]
};
