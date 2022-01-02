require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ganache");
require("dotenv").config();
// require("solidity-coverage");

const fs = require('fs');
// const privateKey = fs.readFileSync('.secret').toString();//this will reference our metamask private key


module.exports = {
  networks: {
    hardhat: {
      chainId: 1337,
    },
    mumbai: {
      url: `https://polygon-mumbai.infura.io/v3/${process.env.PROJECT_ID}`,
      accounts: [process.env.PRIVATE_KEY],
    },
    mainnet: {
      url: `https://polygon-mainnet.infura.io/v3/${process.env.PROJECT_ID}`,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
  solidity: "0.8.4",
};
