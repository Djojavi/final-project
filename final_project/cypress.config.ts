import { defineConfig } from "cypress";
import webpackPreprocessor from '@cypress/webpack-preprocessor';

export default defineConfig({
  allowCypressEnv: false,

  e2e: {
    setupNodeEvents(on, config) {
      on('file:preprocessor', webpackPreprocessor({
        typescript: require.resolve('typescript'),
      }));
    },
  },
});
