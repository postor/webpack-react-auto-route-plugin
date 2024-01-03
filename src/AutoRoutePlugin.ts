import fs from 'fs'
import files from "./get-routes-files";

type Option = {
  root: string;
  skip: RegExp;
  extensions: string[];
  getRoutesFile: RegExp;
};

/**
 * It's a webpack plugin
 * - compile ../get-routes.js with ./loader.js
 * - register recompile ../get-routes.js callback to structure_change, like ee.on('structure_change', cb)
 */
class AutoRoutePlugin {
  option: Option;

  constructor(opts: Partial<Option> = {}) {
    this.option = {
      root: './src/pages', // Route base on the structure of './src/pages'
      skip: /^\$/, // Ignore files starting with '$'
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'], // Only route files with these extensions
      getRoutesFile: /get-routes\.js/,
      ...opts,
    }
  }

  apply(compiler: any) {
    // Assuming you have a loader called 'get-routes-loader' to compile './get-routes.js'
    const loaderPath = require.resolve('./loader.js')

    compiler.options.module.rules.push({
      test: this.option.getRoutesFile,
      use: {
        loader: loaderPath,
        options: this.option
      },
    });
  }
}

export default AutoRoutePlugin;


function updateFile(file: string) {
  const time = new Date();
  try {
    fs.utimesSync(file, time, time);
  } catch (err) {
    fs.closeSync(fs.openSync(file, 'w'));
  }
}