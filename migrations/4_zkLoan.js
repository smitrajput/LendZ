const ZkLoan = artifacts.require("ZkLoan");
const Kernel = artifacts.require("./Kernel.sol");

module.exports = async function(deployer) {
    await deployer.deploy(Kernel);
    const _kernel = await Kernel.deployed()
    // console.log(_kernel);
    deployer.deploy(ZkLoan, _kernel.address);
};