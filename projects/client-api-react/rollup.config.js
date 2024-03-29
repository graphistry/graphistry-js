import { babel } from '@rollup/plugin-babel';
import external from 'rollup-plugin-peer-deps-external';
import del from 'rollup-plugin-delete';
import pkg from './package.json';
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { terser } from "rollup-plugin-terser";

const globals = {
    'react': 'React',
    'react-dom': 'ReactDOM',
    'prop-types': 'PropTypes'
};
const name = "CRATemplate";

export default {
    input: pkg.source,
    output: [
        //{ globals, file: pkg.main, format: 'cjs' },
        { globals, file: 'dist/index.esm.js',      format: 'esm' },
        { globals, file: 'dist/index.esm.min.js',  format: 'esm',       plugins: [terser()] },
        //{ globals, file: pkg.module, format: 'iife', name },
        { globals, file: `dist/index.umd.js`,      format: 'umd', name },
        { globals, file: `dist/index.umd.min.js`,  format: 'umd', name, plugins: [terser()] }
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