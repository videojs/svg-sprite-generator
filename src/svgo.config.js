export default {
  js2svg: {
    indent: 2,
    pretty: true
  },
  plugins: [
    'removeXMLProcInst',
    'cleanupAttrs',
    'cleanupIds',
    {
      name: 'removeAttrs',
      params: {
        attrs: [
          'version',
          'sketch.type',
          'xmlns.sketch',
          'stroke-width',
          'fill-rule',
          'style'
        ]
      }
    },
    'removeUselessStrokeAndFill',
    'removeDimensions',
    'removeDesc',
    'removeComments',
    'removeTitle',
    'removeUselessDefs',
    'removeStyleElement',
    'removeXlink',
    'collapseGroups',
    'convertPathData',
    'convertTransform',
    'mergePaths'
  ]
};
