/// <reference types='vitest' />
import { defineConfig } from "vite";

import { nxViteTsPaths } from "@nx/vite/plugins/nx-tsconfig-paths.plugin";
import { nxCopyAssetsPlugin } from "@nx/vite/plugins/nx-copy-assets.plugin";

export default defineConfig({
	root: __dirname,
	cacheDir: "../../node_modules/.vite/apps/backend",
	plugins: [nxViteTsPaths(), nxCopyAssetsPlugin(["*.md"])],
	// Uncomment this if you are using workers.
	// worker: {
	//  plugins: [ nxViteTsPaths() ],
	// },
	build: {
		outDir: "../../dist/apps/backend",
		emptyOutDir: true,
		reportCompressedSize: true,
	},
});
