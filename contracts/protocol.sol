// Vyper version of the Lendroid protocol v1
// THIS CONTRACT IS BEING AUDITED!
// Solidity code available at
// https//github.com/lendroidproject/protocol.1.0

pragma solidity ^0.5.7;


// TODO: Import ZkERC20 Interface
import "./AZTEC/interfaces/IZkAsset.sol";

contract ZkLoan {
    // struct representing a kernel
    struct Kernel{
        address lender;
        address borrower;
        address relayer;
        address wrangler;
        address borrow_currency_address;
        address lend_currency_address;
        uint256 lend_currency_offered_value;
        uint256 relayer_fee;
        uint256 monitoring_fee;
        uint256 rollover_fee;
        uint256 closure_fee;
        bytes32 salt;
        uint256 expires_at;
        uint256 daily_interest_rate;
        uint256 position_duration_in_seconds;
    }
    // struct representing a position
    struct Position{
        uint256 index;
        address kernel_creator;
        address lender;
        address borrower;
        address relayer;
        address wrangler;
        uint256 created_at;
        uint256 updated_at;
        uint256 expires_at;
        address borrow_currency_address;
        address lend_currency_address;
        uint256 borrow_currency_value;
        uint256 borrow_currency_current_value;
        uint256 lend_currency_filled_value;
        uint256 lend_currency_owed_value;
        uint256 status;
        uint256 nonce;
        uint256 relayer_fee;
        uint256 monitoring_fee;
        uint256 rollover_fee;
        uint256 closure_fee;
        bytes32 hash;
    }

    // Events of the protocol.
    event ProtocolParameterUpdateNotification(string[64] _notification_key, address indexed _address, uint256 _notification_value);
    event PositionUpdateNotification(address indexed _wrangler,bytes32 indexed _position_hash, string[64] _notification_key, uint256 _notification_value);

    // Variables of the protocol.
    address public protocol_token_address;
    address public owner;
    // kernel
    mapping(bytes32 => uint256) public kernels_filled;
    mapping(bytes32 => uint256)  public kernels_cancelled;
    // all positions
    mapping(bytes32 => Position) public positions;
    uint256 public last_position_index;
    mapping(uint256 => bytes32) public position_index;
    uint256 public position_threshold;
    mapping(address => mapping(uint256 => bytes32)) public borrow_positions;
    mapping(address => mapping(uint256 => bytes32)) public lend_positions;
    mapping(address => mapping(bytes32 => uint256)) borrow_position_index;
    mapping(address => mapping(bytes32 => uint256)) lend_position_index;
    mapping(address => uint256) public borrow_positions_count;
    mapping(address => uint256) public lend_positions_count;

    // wrangler
    mapping(address => bool) public wranglers;
    mapping(address => mapping(address => uint256)) public wrangler_nonces;

    // tokens
    mapping(address => bool) public supported_tokens;

    // nonreentrant locks for positions, inspired from https//github.com/ethereum/vyper/issues/1204
    mapping(bytes32 => bool) nonreentrant_locks;

    // constants
    uint256 public SECONDS_PER_DAY;
    uint256 public POSITION_STATUS_OPEN;
    uint256 public POSITION_STATUS_CLOSED;
    uint256 public POSITION_STATUS_LIQUIDATED;
    uint256 public POSITION_TOPPED_UP;
    address public ZERO_ADDRESS = address(0);



    constructor(address _protocol_token_address) public {
        owner = msg.sender;
        protocol_token_address = _protocol_token_address;
        position_threshold = 10;
        SECONDS_PER_DAY = 86400;
        POSITION_STATUS_OPEN = 1;
        POSITION_STATUS_CLOSED = 2;
        POSITION_STATUS_LIQUIDATED = 3;
        POSITION_TOPPED_UP = 1;
    }

    // // constant functions
    // /**
    //  * Inspired from https//github.com/LayerXcom/verified-vyper-contracts/blob/master/contracts/ecdsa/ECDSA.vy
    //  * @dev Recover signer address from a message by using their signature
    //  * @param _hash bytes32 message, the hash is the signed message. What is recovered is the signer address.
    //  * @param _sig bytes signature, the signature is generated using web3.eth.sign()
    //  */
    
    // function ecrecover_from_signature(bytes32 _hash, bytes[65] _sig) public pure  returns (address) {
    //     if (len(_sig) != 65)
    //         return ZERO_ADDRESS;

    //     int128 v = convert(slice(_sig, start=64, len=1), int128);
    //     if (v < 27)
    //     v += 27;
    //     if (v in [27, 28])
    //         return ecrecover(_hash, convert(v, uint256), extract32(_sig, 0, type=uint256), extract32(_sig, 32, type=uint256));
        
    //     return ZERO_ADDRESS;
    // }

    function is_signer(address _prover, bytes32 _hash, bytes memory _sig) public returns (bool) {
        if (_prover == ecrecover_from_signature(_hash, _sig))
            return true;
        else {
            bytes32 sign_prefix  = "\x19Ethereum Signed Message\n32";
            return _prover ==  ecrecover_from_signature(keccak256(abi.encodePacked(sign_prefix, _hash)), _sig);
        }
    }

    function can_borrow(address _address) public pure returns (bool) {
        return  borrow_positions_count[_address] < position_threshold;
    }

    function can_lend(address _address) public pure returns (bool) {
        return  lend_positions_count[_address] < position_threshold;
    }

    function filled_or_cancelled_loan_amount(bytes32 _kernel_hash) public pure returns (uint256) {
        return kernels_filled[_kernel_hash] + kernels_cancelled[_kernel_hash];
    }

    function position(bytes32 _position_hash) public pure returns (uint256, address, address, address, address, address, uint256, uint256, uint256, address, address, uint256, uint256,
        uint256, uint256, uint256, uint256, uint256, uint256, uint256, uint256, bytes32) {
        return (positions[_position_hash].index, positions[_position_hash].kernel_creator, positions[_position_hash].lender,  positions[_position_hash].borrower,  positions[_position_hash].relayer,  positions[_position_hash].wrangler,  positions[_position_hash].created_at,  positions[_position_hash].updated_at,  positions[_position_hash].expires_at,  positions[_position_hash].borrow_currency_address,  positions[_position_hash].lend_currency_address,  positions[_position_hash].borrow_currency_value,  positions[_position_hash].borrow_currency_current_value,  positions[_position_hash].lend_currency_filled_value,  positions[_position_hash].lend_currency_owed_value,  positions[_position_hash].status,  positions[_position_hash].nonce,  positions[_position_hash].relayer_fee,  positions[_position_hash].monitoring_fee,  positions[_position_hash].rollover_fee,  positions[_position_hash].closure_fee,  positions[_position_hash].hash);
    }

    function position_counts(address _address) public pure returns (uint256, uint256) {
        return ( borrow_positions_count[_address],  lend_positions_count[_address]);
    }

    function kernel_hash(
            address[6] memory _addresses, uint256[5] memory _values,
            uint256 _kernel_expires_at, bytes32 _creator_salt,
            uint256 _daily_interest_rate, uint256 _position_duration_in_seconds
            ) public pure returns (bytes32) {
        return keccak256(
            abi.encodePacked(
                address(this),
                _addresses[0],
                _addresses[1],
                _addresses[2],
                _addresses[3],
                _addresses[4],
                _addresses[5],
                _values[0],
                _values[1],
                _values[2],
                _values[3],
                _values[4],
                _creator_salt,
                _kernel_expires_at,
                _daily_interest_rate,
                _position_duration_in_seconds
            )
        );

        // return sha3(
        //     concat(
        //         convert(self, bytes32),
        //         convert(_addresses[0], bytes32),// lender
        //         convert(_addresses[1], bytes32),// borrower
        //         convert(_addresses[2], bytes32),// relayer
        //         convert(_addresses[3], bytes32),// wrangler
        //         convert(_addresses[4], bytes32),// collateralToken
        //         convert(_addresses[5], bytes32),// loanToken
        //         convert(_values[0], bytes32),// loanAmountOffered
        //         convert(_values[1], bytes32),// relayerFeeLST
        //         convert(_values[2], bytes32),// monitoringFeeLST
        //         convert(_values[3], bytes32),// rolloverFeeLST
        //         convert(_values[4], bytes32),// closureFeeLST
        //         _creator_salt,// creatorSalt
        //         convert(_kernel_expires_at, bytes32),// offerExpiryuint256
        //         convert(_daily_interest_rate, bytes32),// loanInterestRatePerDay
        //         convert(_position_duration_in_seconds, bytes32)// loanDuration
        //     )
        // );
        
    }

    function position_hash(
                address[7] memory _addresses,
                // _addresses kernel_creator, lender, borrower, relayer, wrangler, collateralToken, loanToken
                uint256[7] memory _values,
                // _values collateralAmount, loanAmountOffered, relayerFeeLST, monitoringFeeLST, rolloverFeeLST, closureFeeLST, loanAmountFilled
                uint256 _lend_currency_owed_value, uint256 _nonce
            ) public pure returns (bytes32) {
        return keccak256(
            abi.encodePacked(
                address(this),
                _addresses[5],
                _addresses[6],
                _values[0],
                _values[6],
                _lend_currency_owed_value,
                _addresses[0],
                _addresses[1],
                _addresses[2],
                _addresses[3],
                _addresses[4],
                _values[2],
                _values[3],
                _values[4],
                _values[5],
                _nonce
            )
        );
        // return sha3(
        //     concat(
        //         convert(self, bytes32),
        //         convert(_addresses[5], bytes32),// collateralToken
        //         convert(_addresses[6], bytes32),// loanToken
        //         convert(_values[0], bytes32),// collateralAmount
        //         convert(_values[6], bytes32),// loanAmountFilled
        //         convert(_lend_currency_owed_value, bytes32),// loanAmountOwed
        //         convert(_addresses[0], bytes32),// kernel_creator
        //         convert(_addresses[1], bytes32),// lender
        //         convert(_addresses[2], bytes32),// borrower
        //         convert(_addresses[3], bytes32),// relayer
        //         convert(_addresses[4], bytes32),// wrangler
        //         convert(_values[2], bytes32),// relayerFeeLST
        //         convert(_values[3], bytes32),// monitoringFeeLST
        //         convert(_values[4], bytes32),// rolloverFeeLST
        //         convert(_values[5], bytes32),// closureFeeLST
        //         convert(_nonce, bytes32)// nonce
        //     )
        // )
    }

    function owed_value(
            uint256 _filled_value,
            uint256 _kernel_daily_interest_rate,
            uint256 _position_duration_in_seconds
        ) public pure returns (uint256) {
        // calculate owed value
        uint256 _position_duration_in_days = _position_duration_in_seconds / SECONDS_PER_DAY;
        uint256 _total_interest = _filled_value * _position_duration_in_days * _kernel_daily_interest_rate / 10 ** 20;
        return _filled_value + _total_interest;
    }

    // escape hatch functions
    function escape_hatch_token(address _token_address, bytes memory _proofData, bytes memory _signatures) public returns (bool) {
        require (msg.sender ==  owner);
        // transfer token from this address to owner (message sender)
        // bool token_transfer = ERC20(_token_address).transfer(
        //     msg.sender,
        //     ERC20(_token_address).balanceOf(address(this))
        // );
        // require (token_transfer);

        IZkAsset(_token_address).confidentialTransfer(
            _proofData,
            _signatures
        );
        return (true);
    }

    // protocol parameter functions
    function set_position_threshold(uint256 _value) public returns (bool) {
        require (msg.sender ==  owner);
        position_threshold = _value;
        emit ProtocolParameterUpdateNotification("position_threshold", ZERO_ADDRESS, _value);
        return true;
    }

    function set_wrangler_status(address _address, bool _is_active) public returns (bool) {
        require(msg.sender ==  owner);
        wranglers[_address] = _is_active;
        emit ProtocolParameterUpdateNotification("wrangler_status", _address, _is_active?1:0);
        return true;
    }

    function set_token_support(address _address, bool _is_active) public returns (bool) {
        require (msg.sender ==  owner);
        require (_address.is_contract);
        supported_tokens[_address] = _is_active;
        emit ProtocolParameterUpdateNotification("token_support", _address, _is_active?1:0);
        return true;
    }

    // internal functions
    // @private
    function lock_position(bytes32 _position_hash) internal {
        require (nonreentrant_locks[_position_hash] == false);
        nonreentrant_locks[_position_hash] = true;
    }
        


    // @private
    function unlock_position(bytes32 _position_hash) internal {
        require  (nonreentrant_locks[_position_hash] == true);
        nonreentrant_locks[_position_hash] = false;
    }
        


    // @private
    function record_position(address _lender, address _borrower, bytes32 _position_hash) internal{
        require (can_borrow(_borrower));
        require (can_lend(_lender));
        // borrow position
        borrow_positions_count[_borrower] += 1;
        borrow_position_index[_borrower][_position_hash] = borrow_positions_count[_borrower];
        borrow_positions[_borrower][borrow_positions_count[_borrower]] = _position_hash;
        // lend position
        lend_positions_count[_lender] += 1;
        lend_position_index[_lender][_position_hash] = lend_positions_count[_lender];
        lend_positions[_lender][lend_positions_count[_lender]] = _position_hash;
    }
        


    // @private
    function remove_position(bytes32 _position_hash) public {
        address _borrower =  positions[_position_hash].borrower;
        address _lender =  positions[_position_hash].lender;
        // update borrow position indices
        uint256 _current_position_index =  borrow_position_index[_borrower][_position_hash];
        uint256 _last_position_index =  borrow_positions_count[_borrower];
        bytes32 _last_position_hash =  borrow_positions[_borrower][_last_position_index];
        borrow_positions[_borrower][_current_position_index] =  borrow_positions[_borrower][_last_position_index];
        borrow_positions[_borrower][_last_position_index] = bytes32(0);
        borrow_position_index[_borrower][_position_hash] = 0;
        borrow_position_index[_borrower][_last_position_hash] = _current_position_index;
        borrow_positions_count[_borrower] -= 1;
        // update lend position indices
        _current_position_index = lend_position_index[_lender][_position_hash];
        _last_position_index = lend_positions_count[_lender];
        _last_position_hash = lend_positions[_lender][_last_position_index];
        lend_positions[_lender][_current_position_index] = lend_positions[_lender][_last_position_index];
        lend_positions[_lender][_last_position_index] = bytes32(0);
        lend_position_index[_lender][_position_hash] = 0;
        lend_position_index[_lender][_last_position_hash] = _current_position_index;
        lend_positions_count[_lender] -= 1;
    }


    // @public
    function open_position(
            address _kernel_creator,
            address[6] memory _addresses,
            // _addresses lender, borrower, relayer, wrangler, collateralToken, loanToken
            uint256[7] memory _values,
            // _values collateralAmount, loanAmountOffered, relayerFeeLST, monitoringFeeLST, rolloverFeeLST, closureFeeLST, loanAmountFilled (aka, loanAmountBorrowed)
            uint256 _nonce,
            uint256 _kernel_daily_interest_rate,
            uint256 _position_duration_in_seconds,
            uint256 _approval_expires,
            bytes memory _sig_data,
            bytes memory 
            // v, r, s of wrangler
        ) public {
            // this is a `fake internal` function for now!
        require(msg.sender == address(this));
        // calculate owed value
        uint256 _lend_currency_owed_value = owed_value(_values[6], _kernel_daily_interest_rate, _position_duration_in_seconds);
        // create position from struct
        Position memory _new_position = Position({
            index: last_position_index,
            kernel_creator: _kernel_creator,
            lender: _addresses[0],
            borrower: _addresses[1],
            relayer: _addresses[2],
            wrangler: _addresses[3],
            created_at: block.timestamp,
            updated_at: block.timestamp,
            expires_at: block.timestamp + _position_duration_in_seconds,
            borrow_currency_address: _addresses[4],
            lend_currency_address: _addresses[5],
            borrow_currency_value: _values[0],
            borrow_currency_current_value: _values[0],
            lend_currency_filled_value: _values[6],
            lend_currency_owed_value: _lend_currency_owed_value,
            status: POSITION_STATUS_OPEN,
            nonce: _nonce,
            relayer_fee: _values[2],
            monitoring_fee: _values[3],
            rollover_fee: _values[4],
            closure_fee: _values[5],
            hash: position_hash([_kernel_creator, _addresses[0], _addresses[1],
                _addresses[2], _addresses[3], _addresses[4], _addresses[5]],
                _values, _lend_currency_owed_value, _nonce
            )
        });
        // lock position_non_reentrant before loan creation
        lock_position(bytes32(1));
        // validate wrangler's activation status
        require(wranglers[_new_position.wrangler]);
        // validate wrangler's approval expiry
        require(_approval_expires > block.timestamp);
        // validate wrangler's nonce
        require(_nonce ==  wrangler_nonces[_new_position.wrangler][_kernel_creator] + 1);
        // increment wrangler's nonce for kernel creator
        wrangler_nonces[_new_position.wrangler][_kernel_creator] += 1;
        // validate wrangler's signature
        require (is_signer(_new_position.wrangler, _new_position.hash, _sig_data));
        // update position index
        position_index[last_position_index] = _new_position.hash;
        last_position_index += 1;
        positions[_new_position.hash] = _new_position;
        // record position
        record_position(_addresses[0], _addresses[1], _new_position.hash);
        // transfer borrow_currency_current_value from borrower to this address
        // bool token_transfer = ERC20(_new_position.borrow_currency_address).transferFrom(
        //     _new_position.borrower,
        //     address(this),
        //     _new_position.borrow_currency_current_value
        // );
        // require(token_transfer);

        IZkAsset(_new_position.borrow_currency_address).confidentialTransferFrom(_proof, _proofOutput);

        // // transfer lend_currency_filled_value from lender to borrower
        // token_transfer = ERC20(_new_position.lend_currency_address).transferFrom(
        //     _new_position.lender,
        //     _new_position.borrower,
        //     _new_position.lend_currency_filled_value
        // );
        // require(token_transfer);

        IZkAsset(_new_position.lend_currency_address).confidentialTransferFrom(_proof, _proofOutput);
        // transfer monitoring_fee from lender to wrangler
        token_transfer = ERC20( protocol_token_address).transferFrom(
            _new_position.lender,
            _new_position.wrangler,
            _new_position.monitoring_fee
        );
        require(token_transfer);
        // notify wrangler that a position has been opened
        emit PositionUpdateNotification(_new_position.wrangler, _new_position.hash, "status",  POSITION_STATUS_OPEN);
        // unlock position_non_reentrant after loan creation
        unlock_position(_new_position.hash);
        }
        


    // external functions
    // @public
    function topup_position(bytes32 _position_hash, uint256 _borrow_currency_increment) public returns (bool){
        Position memory existing_position = positions[_position_hash];
        // confirm sender is borrower
        require(msg.sender == existing_position.borrower);
        // confirm position has not expired yet
        require(existing_position.expires_at >= block.timestamp);
        // confirm position is still active
        require(existing_position.status ==  POSITION_STATUS_OPEN);
        // lock position_non_reentrant before topup
        lock_position(_position_hash);
        // perform topup
        existing_position.borrow_currency_current_value += _borrow_currency_increment;
        positions[_position_hash] = existing_position;
        // transfer borrow_currency_current_value from borrower to this address
        bool token_transfer = ERC20(existing_position.borrow_currency_address).transferFrom(
            existing_position.borrower,
            address(this),
            _borrow_currency_increment
        );
        require(token_transfer);
        // Notify wrangler that a position has been topped up
        emit PositionUpdateNotification(existing_position.wrangler, _position_hash, "borrow_currency_value",  POSITION_TOPPED_UP);
        // unlock position_non_reentrant after topup
        unlock_position(_position_hash);

        return true;
    }


    // @public
    function liquidate_position(bytes32 _position_hash) public returns (bool){
        Position memory existing_position = positions[_position_hash];
        // confirm position has expired
        require(existing_position.expires_at < block.timestamp);
        // confirm sender is lender or wrangler
        require (((msg.sender == existing_position.wrangler) || (msg.sender == existing_position.lender)));
        // confirm position is still active
        require (existing_position.status ==  POSITION_STATUS_OPEN);
        // lock position_non_reentrant before liquidation
        lock_position(_position_hash);
        // perform liquidation
        existing_position.status =  POSITION_STATUS_LIQUIDATED;
        positions[_position_hash] = existing_position;
        remove_position(_position_hash);
        // transfer borrow_currency_current_value from this address to the sender
        bool token_transfer = ERC20(existing_position.borrow_currency_address).transfer(
            msg.sender,
            existing_position.borrow_currency_current_value
        );
        require(token_transfer);
        // notify wrangler that a position has been liquidated
        emit PositionUpdateNotification(existing_position.wrangler, _position_hash, "status",  POSITION_STATUS_LIQUIDATED);
        // unlock position_non_reentrant after liquidation
        unlock_position(_position_hash);

        return true;
    }


    // @public
    function close_position(bytes32 _position_hash) public returns (bool){
        Position memory existing_position = positions[_position_hash];
        // confirm sender is borrower
        require(msg.sender == existing_position.borrower);
        // confirm position has not expired yet
        require(existing_position.expires_at >= block.timestamp);
        // confirm position is still active
        require(existing_position.status ==  POSITION_STATUS_OPEN);
        // lock position_non_reentrant before closure
        lock_position(_position_hash);
        // perform closure
        existing_position.status =  POSITION_STATUS_CLOSED;
        positions[_position_hash] = existing_position;
        remove_position(_position_hash);
        // transfer lend_currency_owed_value from borrower to lender
        bool token_transfer = ERC20(existing_position.lend_currency_address).transferFrom(
            existing_position.borrower,
            existing_position.lender,
            existing_position.lend_currency_owed_value
        );
        require (token_transfer);
        // transfer borrow_currency_current_value from this address to borrower
        token_transfer = ERC20(existing_position.borrow_currency_address).transfer(
            existing_position.borrower,
            existing_position.borrow_currency_current_value
        );
        require (token_transfer);
        // Notify wrangler that a position has been closed
        emit PositionUpdateNotification(existing_position.wrangler, _position_hash, "status",  POSITION_STATUS_CLOSED);
        // unlock position_non_reentrant after closure
        unlock_position(_position_hash);

        return true;
    }
        


    // @public
    function fill_kernel(
            address[6] memory _addresses,
            // _addresses lender, borrower, relayer, wrangler, collateralToken, loanToken
            uint256[7] memory _values,
            // _values collateralAmount, loanAmountOffered, relayerFeeLST, monitoringFeeLST, rolloverFeeLST, closureFeeLST, loanAmountFilled
            uint256 _nonce,
            uint256 _kernel_daily_interest_rate,
            bool _is_creator_lender,
            uint256[2] memory _timestamps,
            // kernel_expires_at, wrangler_approval_expires_at
            uint256 _position_duration_in_seconds,
            // loanDuration
            bytes32 _kernel_creator_salt,
            bytes memory _sig_data_kernel_creator,
            bytes memory _sig_data_wrangler
            // v, r, s of kernel_creator and wrangler
            ) public returns (bool){
                // validate _lender is not empty
                require(_addresses[0] != ZERO_ADDRESS);
                // validate _borrower is not empty
                require(_addresses[1] != ZERO_ADDRESS);
                address _kernel_creator = _addresses[1];
                Kernel memory _kernel = Kernel({
                    lender: ZERO_ADDRESS,
                    borrower: _addresses[1],
                    relayer: _addresses[2],
                    wrangler: _addresses[3],
                    borrow_currency_address: _addresses[4],
                    lend_currency_address: _addresses[5],
                    lend_currency_offered_value: _values[1],
                    relayer_fee: _values[2],
                    monitoring_fee: _values[3],
                    rollover_fee: _values[4],
                    closure_fee: _values[5],
                    salt: _kernel_creator_salt,
                    expires_at: _timestamps[0],
                    daily_interest_rate: _kernel_daily_interest_rate,
                    position_duration_in_seconds: _position_duration_in_seconds
                });
                if(_is_creator_lender){
                    _kernel_creator = _addresses[0];
                    _kernel.lender = _addresses[0];
                    _kernel.borrower = ZERO_ADDRESS;
                }
                // It's OK if _relayer is empty
                // validate _wrangler is not empty
                require(_kernel.wrangler != ZERO_ADDRESS);
                // validate _collateralToken is a contract address
                require(supported_tokens[_kernel.borrow_currency_address]);
                // validate _loanToken is a contract address
                require(supported_tokens[_kernel.lend_currency_address]);
                // validate loan amounts
                require(_values[0] > 0);
                require(_kernel.lend_currency_offered_value > 0);
                require(_values[6] > 0);
                // validate asked and offered expiry timestamps
                require(_kernel.expires_at > block.timestamp);
                // validate daily interest rate on Kernel is greater than 0
                require(_kernel.daily_interest_rate > 0);
                // compute hash of kernel
                bytes32 _k_hash =  kernel_hash(
                    [_kernel.lender, _kernel.borrower, _kernel.relayer, _kernel.wrangler,
                    _kernel.borrow_currency_address, _kernel.lend_currency_address],
                    [_kernel.lend_currency_offered_value,
                    _kernel.relayer_fee, _kernel.monitoring_fee, _kernel.rollover_fee, _kernel.closure_fee],
                    _kernel.expires_at, _kernel.salt, _kernel.daily_interest_rate, _kernel.position_duration_in_seconds);
                // validate kernel_creator's signature
                require(is_signer(_kernel_creator, _k_hash, _sig_data_kernel_creator));
                // validate loan amount to be filled
                require(_kernel.lend_currency_offered_value - filled_or_cancelled_loan_amount(_k_hash) >=_values[6]);
                // fill offer with lending currency
                kernels_filled[_k_hash] += _values[6];
                // open position
                open_position(
                    _kernel_creator, _addresses, _values,
                    _nonce, _kernel_daily_interest_rate,
                    _position_duration_in_seconds, _timestamps[1], _sig_data_wrangler
                );
                // transfer relayerFeeLST from kernel creator to relayer
                if((_kernel.relayer != ZERO_ADDRESS) && (_kernel.relayer_fee > 0)){
                    bool token_transfer = ERC20( protocol_token_address).transferFrom(
                        _kernel_creator,
                        _kernel.relayer,
                        _kernel.relayer_fee
                    );
                    require(token_transfer);
                }
                    

                return true;
            }
        


    // @public
    function cancel_kernel(
            address[6] memory _addresses, uint256[5] memory _values,
            uint256 _kernel_expires, bytes32 _kernel_creator_salt,
            uint256 _kernel_daily_interest_rate, uint256 _position_duration_in_seconds,
            bytes memory _sig_data,
            uint256 _lend_currency_cancel_value) public returns (bool){
                // compute kernel hash from inputs
                Kernel memory _kernel = Kernel({
                    lender: _addresses[0],
                    borrower: _addresses[1],
                    relayer: _addresses[2],
                    wrangler: _addresses[3],
                    borrow_currency_address: _addresses[4],
                    lend_currency_address: _addresses[5],
                    lend_currency_offered_value: _values[0],
                    relayer_fee: _values[1],
                    monitoring_fee: _values[2],
                    rollover_fee: _values[3],
                    closure_fee: _values[4],
                    salt: _kernel_creator_salt,
                    expires_at: _kernel_expires,
                    daily_interest_rate: _kernel_daily_interest_rate,
                    position_duration_in_seconds: _position_duration_in_seconds
                });
                bytes32 _k_hash = kernel_hash(
                    [_kernel.lender, _kernel.borrower, _kernel.relayer, _kernel.wrangler,
                    _kernel.borrow_currency_address, _kernel.lend_currency_address],
                    [_kernel.lend_currency_offered_value,
                    _kernel.relayer_fee, _kernel.monitoring_fee, _kernel.rollover_fee, _kernel.closure_fee],
                    _kernel.expires_at, _kernel.salt, _kernel.daily_interest_rate, _kernel.position_duration_in_seconds);
                // verify sender is kernel creator
                require(is_signer(msg.sender, _k_hash, _sig_data));
                // verify sanity of offered and cancellation amounts
                require(_kernel.lend_currency_offered_value > 0);
                require(_lend_currency_cancel_value > 0);
                // verify cancellation amount does not exceed remaining loan amount to be filled
                require(_kernel.lend_currency_offered_value - _k_hash >= _lend_currency_cancel_value);
                kernels_cancelled[_k_hash] += _lend_currency_cancel_value;

                return true;
            }
        
}