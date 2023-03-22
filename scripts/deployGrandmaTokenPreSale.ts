import { ethers, hardhatArguments } from "hardhat";

async function main() {

  // default -> mainnet
  let args = {
    rate: 350000, // ~ 0.005$ for ETHUSD at 1750$
    beneficier: process.env.GRANDMA_TOKEN_BENEFICIER_MAINNET,
    token: process.env.GRANDMA_TOKEN_MAINNET,
    provider: process.env.GRANDMA_TOKEN_PROVIDER_MAINNET,
    openingTime: 1680300000,  // 01/04/2023
    closingTime: 1682892000   // 01/05/2023
  }

  switch (hardhatArguments.network) {
    case "sepolia":
      args = {
        rate: 350000, // ~ 0.005$ for ETHUSD at 1750$
        beneficier: process.env.GRANDMA_TOKEN_BENEFICIER_SEPOLIA,
        token: process.env.GRANDMA_TOKEN_SEPOLIA,
        provider: process.env.GRANDMA_TOKEN_PROVIDER_SEPOLIA,
        openingTime: 1679612400,  // 24/03/2023
        closingTime: 1679954400   // 28/03/2023
      }

      break;
    case "goerli":
      args = {
        rate: 350000, // ~ 0.005$ for ETHUSD at 1750$
        beneficier: process.env.GRANDMA_TOKEN_BENEFICIER_GOERLI,
        token: process.env.GRANDMA_TOKEN_GOERLI,
        provider: process.env.GRANDMA_TOKEN_PROVIDER_GOERLI,
        openingTime: 1679612400,  // 24/03/2023
        closingTime: 1679954400   // 28/03/2023
      }

      break;
  }

  const preSaleFactory = await ethers.getContractFactory("GrandmaTokenPreSale");
  const preSale = await preSaleFactory.deploy(            
    args.rate,
    args.beneficier,
    args.token,
    args.provider,
    args.openingTime,
    args.closingTime
  );

  await preSale.deployed();

  console.log(
    `Pre-sale deployed to ${preSale.address} with args ${JSON.stringify(args)}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
