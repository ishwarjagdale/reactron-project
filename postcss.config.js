/* eslint global-require: off, import/no-extraneous-dependencies: off */
const tailwind = require("tailwindcss");
const autoprefixer = require("autoprefixer");

module.exports = {
	plugins: [tailwind, autoprefixer],
};