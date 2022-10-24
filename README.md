# Frontend AliceNet Developer ETH Wrapper

This is a quick wrapper for the ETH environment within [alicenet](https://github.com/alicenet/alicenet/tree/main/bridge)

The goal is to supply a quick way to spin up a local environment for UI testing for front-end developers


## Getting Started

1. Run a recursive clone of this directory:  
   `git clone git@github.com:alicenet/alicenet-eth-dev-wrapper.git --recursive`
2. Run `npm run i`
4. Run `node index.js`
5. You will see an error about a script not existing, wait until you see it print the following line:  
   `Creating Folder at../scripts/generated since it didn't exist before!`
6. Kill the process and run `node index.js` again to start the environment
