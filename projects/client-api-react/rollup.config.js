import { babel } from '@rollup/plugin-babel';
import external from 'rollup-plugin-peer-deps-external';
import del from 'rollup-plugin-delete';
import pkg from './package.json';
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import { terser } from "rollup-plugin-terser";

const globals = {
    'react': 'React',
    'react-dom': 'ReactDOM',
    'prop-types': 'PropTypes'
};
const name = "Graphistry";
const replaceNodeEnvStr = defaultNodeEnv => `typeof process !== 'undefined' && process.env && process.env.NODE_ENV ? process.env.NODE_ENV : "${defaultNodeEnv}"`;

export default {
    input: pkg.source,
    output: [
        //{ globals, file: pkg.main, format: 'cjs' },
        { globals, file: 'dist/index.esm.js',      format: 'esm',       plugins: [replace({'process.env.NODE_ENV': replaceNodeEnvStr('development')})] },
        { globals, file: 'dist/index.esm.min.js',  format: 'esm',       plugins: [replace({'process.env.NODE_ENV': replaceNodeEnvStr('production')}), terser()] },
        //{ globals, file: pkg.module, format: 'iife', name },
        { globals, file: `dist/index.umd.js`,      format: 'umd', name, plugins: [replace({'process.env.NODE_ENV': replaceNodeEnvStr('development')})] },
        { globals, file: `dist/index.umd.min.js`,  format: 'umd', name, plugins: [replace({'process.env.NODE_ENV': replaceNodeEnvStr('production')}), terser()] }
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