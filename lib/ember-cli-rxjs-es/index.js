/* jshint node: true */
'use strict';

var Funnel     = require('broccoli-funnel');
var MergeTrees = require('broccoli-merge-trees');
var path = require('path');
var replace = require('broccoli-replace');

module.exports = {
  name: 'ember-cli-rxjs-es',

  isDevelopingAddon: function() {
    return true;
  },

  treeForAddon: function(_tree) {
    var rxjsSource = path.join(require.resolve('rxjs-es'), '..');
    var rxjsSourceWithoutInvalidAsyncReferences = replace(rxjsSource, {
      files: [
        'Rx.DOM.js',
        'Rx.js'
      ],
      patterns: [
        { match: /async,/, replace: 'async: async,' }
      ]
    });

    var rxjs = new Funnel(rxjsSourceWithoutInvalidAsyncReferences, {
      include: ['**/*.js'],
      destDir: './modules/rxjs'
    });

    return rxjs;
  }
};
