export default {
  plugins: [
    {
      name: 'removeAttrs',
      params: {
        attrs: [
          'xmlns',
          'xmlns.xlink',
          'style'
        ],
      },
    },
    {
      name: 'addAttributesToSVGElement',
      params: {
        attributes: [
          {
            style: 'display: none'
          },
          {
            xmlns: 'http://www.w3.org/2000/svg'
          }
        ]
      }
    }
  ],
};
