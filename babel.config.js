module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
      [
          'module-resolver',
          {
              alias: {
                '@env': './config/env.js',
                
              }
          }
      ]
  ],
};