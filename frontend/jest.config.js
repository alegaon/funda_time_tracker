module.exports = {
    testEnvironment: 'jsdom',
    transform: {
      '^.+\\.(js|jsx)$': 'babel-jest',
    },
    transformIgnorePatterns: [
      '/node_modules/(?!(axios)/)',
    ],
    moduleFileExtensions: ['js', 'jsx'],
    setupFilesAfterEnv: ['./setupTests.js'],
};
  