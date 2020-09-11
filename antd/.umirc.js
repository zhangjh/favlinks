
// ref: https://umijs.org/config/
export default {
  plugins: [
    // ref: https://umijs.org/plugin/umi-plugin-react.html
    ['umi-plugin-react', {
      antd: true,
      dva: true,
      dynamicImport: false,
      title: 'antd',
      dll: false,
      hardSource: false,
      routes: {
        path: '/',
        //component: 'src/layouts/index.js',
        exclude: [
          /components/,
        ],
      },
    }],
  ],
  theme: {
    'primary-color': '#f8f8f8',
  },
}
