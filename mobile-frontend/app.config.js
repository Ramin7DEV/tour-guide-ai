// Extends app.json with values that must not be committed.
// GOOGLE_MAPS_API_KEY is stored as an EAS environment variable (secret); Android maps are blank without it.
module.exports = ({ config }) => ({
  ...config,
  android: {
    ...config.android,
    config: {
      ...config.android?.config,
      googleMaps: { apiKey: process.env.GOOGLE_MAPS_API_KEY },
    },
  },
});
