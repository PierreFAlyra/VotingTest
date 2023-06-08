
require('dotenv').config();
const { MNEMONIC, PROJECT_ID } = process.env;

const HDWalletProvider = require('@truffle/hdwallet-provider');

module.exports = {

  networks: {
    development: {
     host: "127.0.0.1",
     port: 8545,
     network_id: "*",
    }
  },

  mocha: {
  },

  compilers: {
    solc: {
      version: "0.8.20",
    }
  }
  
};
