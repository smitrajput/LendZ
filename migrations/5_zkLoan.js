const ZkLoan = artifacts.require("ZkLoan");
const Kernel = artifacts.require("./Kernel.sol");

module.exports = async function(deployer) {
    await deployer.deploy(Kernel);
    const _kernel = await Kernel.deployed()
    // console.log(_kernel);
    return deployer.deploy(ZkLoan, "0xf1d712736ff2b06dda9ba03d959aa70a297ad99b", _kernel.address);
};