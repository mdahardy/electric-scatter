import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
  input: "index.js",
  output: {
    file: "d3.js",
    format: 'iife',
    name: "d3"
  },
  plugins: [nodeResolve()],
};