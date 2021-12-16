require("@nomiclabs/hardhat-waffle");
const fs = require('fs');
const privateKey = fs.readFileSync('.secret').toString();//this will reference our metamask private key

const projectId = '4625d8a5e77f4c678b39423652c6f6cd';//this id should be brought in from the .env file for security

module.exports = {
   networks: {
    hardhat: {
      chainId: 1337
    },
    mumbai: {
      url: `https://polygon-mumbai.infura.io/v3/${projectId}`,
      accounts: [privateKey]
    },
    mainnet: {
      url: `https://polygon-mainnet.infura.io/v3/${projectId}`,
      accounts: [privateKey]  
    }
  },
  solidity: "0.8.4",
};
