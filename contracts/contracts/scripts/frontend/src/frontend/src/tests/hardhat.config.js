require("@nomiclabs/hardhat-waffle");
require("dotenv").config();

const { ALCHEMY_API_KEY, PRIVATE_KEY } = process.env;

module.exports = {
  solidity: "0.8.19",
  networks: {
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
    localhost: {
      url: "http://127.0.0.1:8545"
    }
  },
  paths: {
    artifacts: "./frontend/src/contracts",
  }
};
