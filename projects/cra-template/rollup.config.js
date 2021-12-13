import { babel } from '@rollup/plugin-babel';
import external from 'rollup-plugin-peer-deps-external';
import del from 'rollup-plugin-delete';
import pkg from './package.json';
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';

const globals = {
    'react': 'React',
    'react-dom': 'ReactDOM',
    'prop-types': 'PropTypes'
};
const name = "CRATemplate";

export default {
    input: pkg.source,
    output: [
        { globals, sourcemap: true, file: 'dist/index.cjs.js', format: 'cjs' },
        { globals, sourcemap: true, file: 'dist/index.esm.js', format: 'esm' },
        { globals, sourcemap: true, file: 'dist/index.iife.js', format: 'iife', name },
        { globals, sourcemap: true, file: 'dist/index.umd.js', format: 'umd', name }
    ],
    plugins: [
        nodeResolve({
            extensions: [".js"],
        }),
        external(),
        babel({
            exclude: 'node_modules/**',
            babelHelpers: 'bundled' 
        }),
        commonjs(),
        del({ targets: ['dist/*'] }),
    ],
    external: Object.keys(pkg.peerDependencies || {}),
};