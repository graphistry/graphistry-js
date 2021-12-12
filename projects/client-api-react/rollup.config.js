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
        //{ globals, file: pkg.main, format: 'cjs' },
        //{ globals, file: pkg.module, format: 'esm' },
        //{ globals, file: pkg.module, format: 'iife', name },
        { globals, file: `dist/index.full.umd.js`, format: 'umd', name }
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