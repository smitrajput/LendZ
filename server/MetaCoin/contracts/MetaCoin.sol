pragma solidity >=0.4.25 <0.6.0;

import "./ConvertLib.sol";

// This is just a simple example of a coin-like contract.
// It is not standards compatible and cannot be expected to talk to other
// coin/token contracts. If you want to create a standards-compliant
// token, see: https://github.com/ConsenSys/Tokens. Cheers!

contract MetaCoin {
	mapping (address => uint) balances;

    uint public  version;
    string public constant name = "akatsuki";
    string public constant symbol = "AKT" ;
    uint8 public constant decimals = 18;
    uint total_supply;
    mapping(address => mapping (address => uint256)) allowed;
    

	event Transfer(address indexed _from, address indexed _to, uint256 _value);
    event balanceOf(address _owner, uint256 _balance);
    event setVersionEvent(uint256 indexed _version);
    event Approval(address indexed tokenOwner, address indexed spender, uint tokens);
    
	constructor() public {
		balances[msg.sender] = 10000;
        total_supply = 10000;
        version = 1;
	}

    function totalSupply() public view returns (uint256) {
        return total_supply;
    }
	function sendCoin(address receiver, uint amount) public returns(bool sufficient) {
	
        require (balances[msg.sender] > amount, "insufficient funds");
        // if (balances[msg.sender] < amount) return false;
		balances[msg.sender] -= amount;
		balances[receiver] += amount;
		emit Transfer(msg.sender, receiver, amount);
		return true;
	}

	function getBalanceInEth(address addr) public returns(uint){
		return ConvertLib.convert(getBalance(addr),2);
	}


    function approve(address delegate, uint numTokens) public returns (bool) {
        allowed[msg.sender][delegate] = numTokens;
        emit Approval(msg.sender, delegate, numTokens);
        return true;
    }
	function getBalance(address addr) public returns(uint) {
		emit balanceOf(addr, balances[addr]);
        return balances[addr];
	}

    function setVersion(uint _version) public returns (uint) {
        emit setVersionEvent(_version);
        version = _version;
        return version;
    }
}
