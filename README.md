# Decentralized Poker

An experiment in making a decentralized poker game using various on-chain & crypto-based technologies.

## Installation

### Pre-requisites

None yet

### Steps

None yet

## Running

### Hardhat

-   `hardhat:chain`: Run a hardhat chain
-   `hardhat:fork`: Atm, alias of chain
-   `hardhat:compile`: Compile the contracts
-   `hardhat:deploy-sepolia`: Deploy contracts to Sepolia
-   `hardhat:deploy-base`: Deploy contracts to Base
-   `hardhat:test`: Run contract tests

## Deployment

### Web3URL

Ethereum Sepolia Deployment:

```
# on-chain storage
npx ethfs-cli create -p [pkey] -c 11155111
npx ethfs-cli upload -f apps/poker-ui-react/build -a [deployment address from previous line] -c 11155111 -p [pkey] -t 1
```

```
# cheaper on-chain storage
npx ethfs-cli create -p [pkey] -c 11155111
npx ethfs-cli upload -f apps/poker-ui-react/build -a [deployment address from previous line] -c 11155111 -p [pkey] -t 2

0xE30967d31A432AbdBC5F6816073f9eF02dfD01d5
https://0xE30967d31A432AbdBC5F6816073f9eF02dfD01d5.3333.w3link.io/index.html
```

Base Sepolia Deployment:

```
npx ethfs-cli create -p [pkey] -c 84532
```

### Log of Deployments

1. Test if React could work
    - https://0x4685d6b0d8d873f31ecff8a698298a3437b3966a.sep.w3link.io/index.html

## Documentation

### Apps

-   Poker UI React - React implementation of Poker UI

### Packages

None yet

### Chain IDs

-   Base: 8453
-   Base Sepolia: 84532

### Conventions

-   Package, library, and app names are brief, lower-case, and use hyphens for spacing
-   As much as possible, all packages should try to be self-sufficient
-   As much as possible, all applications should try to separate concerns to allow for clean deployments and distribution

### Utilities

-   [TypeScript](https://www.typescriptlang.org/) for static type checking
-   [ESLint](https://eslint.org/) for code linting
-   [Prettier](https://prettier.io) for code formatting
