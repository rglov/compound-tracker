module.exports = {
  packagerConfig: {
    name: 'Compound Tracker',
    executableName: 'compound-tracker',
    asar: true
  },
  makers: [
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin', 'linux', 'win32']
    }
  ]
};
