const ERC20_A = artifacts.require("./ERC20_A.sol");
const ERC20_B = artifacts.require("./ERC20_B.sol");
const LST = artifacts.require("./LSTProtocolToken.sol");

module.exports = async (deployer) => {

    const erc20_A = await deployer.deploy(ERC20_A);
    const erc20_B = await deployer.deploy(ERC20_B);
    const lst = await deployer.deploy(LST);
    // console.log("ERC20_A:", erc20_A.address);
    // console.log("ERC20_B:", erc20_B.address);
}