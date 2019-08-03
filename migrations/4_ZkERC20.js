const ZkERC20 = artifacts.require("./ZkERC20.sol");

const ERC20_A = artifacts.require("./ERC20_A.sol");
const ERC20_B = artifacts.require("./ERC20_B.sol");

const ACE = artifacts.require("./ACE.sol");

module.exports = async (deployer) => {
    const _ACE = await ACE.deployed();
    const _ERC20_A = await ERC20_A.deployed();
    const _ERC20_B = await ERC20_B.deployed();
    // console.log(_ERC20_A, _ERC20_B);
    const zkERC20_A = await deployer.deploy(ZkERC20, _ACE.address, _ERC20_A.address); // random address for now
    const zkERC20_B = await deployer.deploy(ZkERC20, _ACE.address, _ERC20_B.address); // random address for now

    // console.log("zkERC20_A:", zkERC20_A.address);
    // console.log("zkERC20_B:", zkERC20_B.address);
}
