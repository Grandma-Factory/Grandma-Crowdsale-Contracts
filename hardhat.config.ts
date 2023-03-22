import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

require('dotenv').config({ path: require('find-config')('.env') })

const config: HardhatUserConfig = {
  solidity: "0.5.17",
  etherscan: {
    apiKey: process.env.ETHSCAN_API_KEY,
  },
  networks: {
    hardhat: {
      chainId: 1337, // default is 31337
    },
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_SEPOLIA_API_KEY}`,
      accounts: [process.env.SEPOLIA_PRIVATE_KEY],
    },
    goerli: {
      url: `https://eth-goerli.g.alchemy.com/v2/${process.env.ALCHEMY_GOERLI_API_KEY}`,
      accounts: [process.env.GOERLI_PRIVATE_KEY],
    },
    mainnet: {
      url: `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_MAINNET_API_KEY}`,
      accounts: [process.env.MAINNET_PRIVATE_KEY],
    },
  }
};

export default config;
