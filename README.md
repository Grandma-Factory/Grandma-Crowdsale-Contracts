# Grandma-Crowdsale-Contracts Project

This project contains all Grandma-Factory smart-contracts relatives to crowdsales.


## Installation 

Install node dependencies

```
npm install
```

Create the environment configuration file ```.env```

```
ETHSCAN_API_KEY="..."
ALCHEMY_MAINNET_API_KEY="..."
ALCHEMY_SEPOLIA_API_KEY="..."
MAINNET_PRIVATE_KEY="..."
SEPOLIA_PRIVATE_KEY="..."
...
```


## Usage


Run tests:

```
npx hardhat test
```

Run compilation:


```
npx hardhat compile
```

Deploy GrandmaTokenPreSale example:


```
npx hardhat run --network sepolia scripts/deployGrandmaTokenPreSale.ts 
```