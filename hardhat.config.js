require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
require("dotenv").config();
require("solidity-coverage");

const { PROJECT_ID, PRIVATE_KEY } = process.env;
const fs = require('fs');
const PROJECT_SECRET = fs.readFileSync('.secret').toString();//this will reference our infura secret key

module.exports = {
  networks: {
    hardhat: {
      chainId: 1337,
    },
    kovan: {
      // url: `https://polygon-mumbai.infura.io/v3/${process.env.PROJECT_ID}`,
      url: `https://kovan.infura.io/v3/${process.env.PROJECT_ID}`,
      accounts: [process.env.PRIVATE_KEY],
    },
    mainnet: {
      url: `https://polygon-mainnet.infura.io/v3/${process.env.PROJECT_ID}`,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
  solidity: "0.8.4",
};
