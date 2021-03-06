/*jshint jasmine: true, node: true */
'use strict';

const path = require('path');
const fs = require('fs');

describe('config webpack common', () => {
  function validateAppExtras(spaVersionExists) {
    const lib = require('../config/webpack/common.webpack.config');

    let existsSync = fs.existsSync;

    spyOn(fs, 'existsSync').and.callFake(function (path) {
      if (path.indexOf('app-extras.module') >= 0) {
        return spaVersionExists;
      }

      return existsSync.apply(fs, arguments);
    });

    let config = lib.getWebpackConfig({
      'blackbaud-sky-pages-out-skyux2': {
        mode: 'advanced'
      }
    });

    let alias = config.resolve.alias;

    let expectedAppExtrasAlias = spaVersionExists ?
      path.join(process.cwd(), 'src', 'app', 'app-extras.module.ts') :
      path.join(__dirname, '..', 'src', 'app', 'app-extras.module.ts');

    expect(
      alias['sky-pages-internal/app-extras.module']
    ).toBe(expectedAppExtrasAlias);
  }

  it('should expose a getWebpackConfig method', () => {
    const lib = require('../config/webpack/common.webpack.config');
    expect(typeof lib.getWebpackConfig).toEqual('function');
  });

  it('should handle an advanced mode', () => {
    const lib = require('../config/webpack/common.webpack.config');
    const config = lib.getWebpackConfig({
      'blackbaud-sky-pages-out-skyux2': {
        mode: 'advanced'
      }
    });
    expect(config.entry.app[0]).toContain(process.cwd());
  });

  it('should look in the specified import path when resolving SKY UX', () => {
    const lib = require('../config/webpack/common.webpack.config');
    const importPath = './some-folder';
    const cssPath = path.join(importPath, '/scss/sky.scss');

    let config = lib.getWebpackConfig({
      'blackbaud-sky-pages-out-skyux2': {
        mode: 'advanced',
        skyux: {
          importPath: importPath,
        }
      }
    });

    let alias = config.resolve.alias;

    expect(
      alias['blackbaud-skyux2/dist']
    ).toBe(path.join(process.cwd(), importPath));

    config = lib.getWebpackConfig({
      'blackbaud-sky-pages-out-skyux2': {
        mode: 'advanced',
        skyux: {
          cssPath: cssPath
        }
      }
    });

    alias = config.resolve.alias;

    expect(
      alias['blackbaud-skyux2/dist/css/sky.css']
    ).toBe(path.join(process.cwd(), cssPath));
  });

  it('should default to the local app-extras module when not present in the SPA', () => {
    validateAppExtras(false);
  });

  it('should allow for an app-extras module to be provided by the SPA project', () => {
    validateAppExtras(true);
  });
});
