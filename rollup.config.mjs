import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
export default {
	input: 'src/app.ts',
	output: {
		file: './dist/app.js',
		format: 'cjs'
	},
	"esModuleInterop": true,
	"skipLibCheck": true,
	"moduleResolution": "node",
	plugins: [resolve(), commonjs(), typescript()]
}