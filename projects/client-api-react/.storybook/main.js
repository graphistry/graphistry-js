module.exports = {
  "stories": [
    "../src/**/*.stories.mdx",
    "../src/**/*.stories.@(js|jsx|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-essentials",
    {
      name: '@storybook/addon-storysource',
      options: {
        loaderOptions: {
          injectStoryParameters: false,
        },
      },
    },
    "@storybook/addon-links",
  ],
  webpackFinal: async (config, { configType }) => {
    console.dir(config.plugins, { depth: null }) || config;
    return config;
  }
}