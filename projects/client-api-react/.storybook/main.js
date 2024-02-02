module.exports = {
  "stories": ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|ts|tsx)"],

  "addons": ["@storybook/addon-essentials", {
    name: '@storybook/addon-storysource',
    options: {
      loaderOptions: {
        injectStoryParameters: false,
      },
    },
  }, "@storybook/addon-links", "@storybook/addon-mdx-gfm"],

  webpackFinal: async (config, { configType }) => {
    console.dir(config.plugins, { depth: null }) || config;
    return config;
  },

  framework: {
    name: "@storybook/react-webpack5",
    options: {}
  },

  docs: {
    autodocs: true
  }
}