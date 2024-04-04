const {task} = require("hardhat/config")

/**
 * @param {*} shareHolderAccount - Public Staking Address
 */
async function deployALCB(shareHolderAccount, hre) {
    const owner = await hre.ethers.getSigner(0);
    const ALCB = await hre.ethers.getContractFactory("ALCB")
    console.log("Deploying New ALCB with shareHolderAccount: " + shareHolderAccount)
    const alcb = await ALCB.deploy(owner.address, [
        {
            account: shareHolderAccount,
            percentage: 1000n,
            isMagicTransfer: true,
        },
    ]);
    const done = await alcb.deployTransaction.wait();
    const connected = alcb.connect(owner)
    const ownerBalance = await connected.balanceOf(owner.address)
    console.log(`ALCB deployed to ${done.contractAddress}, owned by ${owner.address}, shareholder is: ${shareHolderAccount}`);
    console.log(`ALCB Initial Owner Balance: ${ownerBalance}, funding account: ${owner.address}`)
    const desiredAmount = hre.ethers.utils.parseEther("1")
    await connected.mint({value: desiredAmount})
    const endingOwnerBalance = await connected.balanceOf(owner.address)
    console.log(`ALCB Initial Ending Balance: ${endingOwnerBalance}`)
}

task("deployNewALCB", "Deploy ALCB").addPositionalParam("shareHolderAccount").setAction(async (taskArgs, hre) => {
    await deployALCB(taskArgs.shareHolderAccount, hre)
})