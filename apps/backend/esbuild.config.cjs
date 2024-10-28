const esbuildPluginTsc = require('esbuild-plugin-tsc');
const path = require('node:path');

/** @type {import('esbuild').BuildOptions}  */
module.exports = {
  keepNames: true,
  plugins: [
    esbuildPluginTsc({
      tsconfigPath: path.join(__dirname, 'tsconfig.app.json'),
    }),
  ],
};
