const chalk = require('chalk');
const spawn = require('child_process').spawn;
const ethers = require('ethers');

let wait = (waitAmt) => (new Promise(async res => setTimeout(res, waitAmt)));

let provider = new ethers.providers.JsonRpcProvider("http://localhost:8545")
main();

async function main() {

    let hhQuiet = true;
    let hardhatChild = spawn('bash');
    let deployerChild = spawn('bash');

    console.log("NOTE: Hardhat Output will be", chalk.yellowBright("YELLOW\n"));

    // Setup pipes...

    hardhatChild.stdout.on('data', function (data) {
        if (!hhQuiet) {
            process.stdout.write(chalk.yellowBright(data.toString()));
        }
    });

    hardhatChild.stderr.on('data', function (data) {
        console.log('hardhat_stderr: ' + data.toString());
    });

    hardhatChild.on('exit', function (code) {
        console.log('hardhat_child process exited with code ' + code.toString());
    });

    deployerChild.stdout.on('data', function (data) {
        process.stdout.write(chalk.greenBright(data.toString()));
        if (data.toString().indexOf("Enabling HH Output") !== -1) {
            hhQuiet = false;
            // Set automining to true
            provider.send("evm_setAutomine", [true]).then(res => {
                // console.log("SetAutomine", String(res));
            });
            provider.send("evm_setIntervalMining", [5000]).then(res => {
                // console.log("SetIntervalMining", String(res));
            });
        }
        if (data.toString().indexOf("Creating Folder at../scripts/generated since it didn't exist before!") !== -1) {
            process.stdout.write(chalk.red("Files now generated, please run again!\n"));
            deployerChild.kill('SIGINT');
            hardhatChild.kill('SIGINT');
            process.exit();
        }

    });

    deployerChild.stderr.on('data', function (data) {
        console.log('deployer_stderr: ' + data.toString());
    });

    deployerChild.on('exit', function (code) {
        console.log('deployer child process exited with code ' + code.toString());
    });

    // Begin process..

    deployerChild.stdin.write("echo 'Quietly starting Local Hardhat Node...\n'\n");
    hardhatChild.stdin.write('cd alicenet/bridge\n');
    hardhatChild.stdin.write('npx hardhat node\n');

    // Wait for hardhat to populate. . .
    await wait(2000);

    // Go to bridge and deploy legacy
    deployerChild.stdin.write('cd alicenet/bridge\n');
    deployerChild.stdin.write("echo '\nDeploying legacy token contract and minting to admin[0]\n'\n");

    deployerChild.stdin.write("echo 'Copy deploymentList to generated\n'\n");
    deployerChild.stdin.write('rm -rf ../scripts/generated\n');
    deployerChild.stdin.write('mkdir -p ../scripts/generated\n');
    deployerChild.stdin.write('cp ../scripts/base-files/deploymentList ../scripts/generated/deploymentList\n');

    deployerChild.stdin.write('npx hardhat deploy-legacy-token-and-update-deployment-args --network dev\n');
    deployerChild.stdin.write("echo '\nDeploying all contracts...\n'\n");
    deployerChild.stdin.write("npx hardhat deploy-contracts --wait-confirmation 0 --input-folder ../scripts/generated --network dev\n");


    // Depoy Lock && Router 
    deployerChild.stdin.write('npx hardhat --network dev deploy-lockup-and-router --factory-address 0x77D7c620E3d913AA78a71acffA006fc1Ae178b66 --enrollment-period 1000 --lock-duration 6000 --total-bonus-amount 2000000\n')
    // Deploy BonusPool
    deployerChild.stdin.write('npx hardhat --network dev create-bonus-pool-position --factory-address 0x77D7c620E3d913AA78a71acffA006fc1Ae178b66\n')

    deployerChild.stdin.write("echo '\n\nEnabling HH Output -- Development Node at Localhost:8545\n\n'\n")

}