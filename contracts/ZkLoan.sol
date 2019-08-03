pragma solidity ^0.5.7;

import "./ZkERC20.sol";
// import "./IERC20.sol";
import "./AZTEC/libs/NoteUtils.sol";
import "./Position.sol";
import "./Kernel.sol";

contract ZkLoan {
    using NoteUtils for bytes;

    struct Note{
        address owner;
        bytes32 noteHash;
    }

    event BorrowerAccessRequested(bytes32 indexed kernelHash, address indexed borrower);
    event BorrowerAccessGranted(bytes32 indexed kernelHash, address indexed borrower);
    // Events of the protocol.
    event ProtocolParameterUpdateNotification(string _notification_key, address indexed _address, uint256 _notification_value);
    event PositionUpdateNotification(address indexed _wrangler, address indexed _position_address, string _notification_key, uint256 _notification_value);

    // Variables of the protocol.
    address public protocol_token_address;
    address public owner;
    // kernel
    address kernel_address;

    // all positions
    // mapping(bytes32 => address) public positions;
    uint256 public last_position_index;
    mapping(uint256 => address) public position_index;
    uint256 public position_threshold;
    mapping(address => mapping(uint256 => address)) public borrow_positions;
    mapping(address => mapping(uint256 => address)) public lend_positions;
    mapping(address => mapping(address => uint256)) borrow_position_index;
    mapping(address => mapping(address => uint256)) lend_position_index;
    mapping(address => uint256) public borrow_positions_count;
    mapping(address => uint256) public lend_positions_count;

    // // wrangler
    mapping(address => bool) public wranglers;
    mapping(address => mapping(address => uint256)) public wrangler_nonces;

    // // tokens
    mapping(address => bool) public supported_tokens;

    // // nonreentrant locks for positions, inspired from https//github.com/ethereum/vyper/issues/1204
    // mapping(bytes32 => bool) nonreentrant_locks;

    // // Mapping to store approvals of borrowers for loan notional view requests
    mapping(bytes32 => mapping(address => bytes)) borrowerApprovals;

    // constants
    // uint256 public SECONDS_PER_DAY;
    uint256 public POSITION_STATUS_OPEN = 1;
    uint256 public POSITION_STATUS_CLOSED = 2;
    uint256 public POSITION_STATUS_LIQUIDATED = 3;
    uint256 public POSITION_TOPPED_UP = 1;
    // address public ZERO_ADDRESS = address(0);
    uint24 constant JOIN_SPLIT_PROOF = 65793;



    constructor(address _protocol_token_address, address _kernel_address) public {
        owner = msg.sender;
        protocol_token_address = _protocol_token_address;
        kernel_address = _kernel_address;
        // position_threshold = 10;
        // // SECONDS_PER_DAY = 86400;
        // POSITION_STATUS_OPEN = 1;
        // POSITION_STATUS_CLOSED = 2;
        // POSITION_STATUS_LIQUIDATED = 3;
        // POSITION_TOPPED_UP = 1;
    }


    function requestAccess(bytes32 _kernelHash) public {
        borrowerApprovals[_kernelHash][msg.sender] = '0x';
        emit BorrowerAccessRequested(_kernelHash, msg.sender);
    }

    function approveAccess(bytes32 _kernelHash, address _borrower, bytes memory _sharedSecret) public {
        borrowerApprovals[_kernelHash][_borrower] = _sharedSecret;
        emit BorrowerAccessGranted(_kernelHash, _borrower);
    }

    // // function can_borrow(address _address) public view returns (bool) {
    // //     return  borrow_positions_count[_address] < position_threshold;
    // // }

    // // function can_lend(address _address) public view returns (bool) {
    // //     return  lend_positions_count[_address] < position_threshold;
    // // }

    // // function filled_or_cancelled_loan_amount(bytes32 _kernel_hash) public view returns (uint256) {
    // //     return kernels_filled[_kernel_hash] + kernels_cancelled[_kernel_hash];
    // // }

    // function position_counts(address _address) public view returns (uint256, uint256) {
    //     return ( borrow_positions_count[_address],  lend_positions_count[_address]);
    // }


    // // owed_value() function to be implemented offchain

    // // Not to implement escape_hatch() function

    // function set_position_threshold(uint256 _value) public returns (bool) {
    //     require (msg.sender == owner, "Sender must be owner");
    //     position_threshold = _value;
    //     emit ProtocolParameterUpdateNotification("position_threshold", address(0), _value);
    //     return true;
    // }

    // function set_wrangler_status(address _address, bool _is_active) public returns (bool) {
    //     require(msg.sender == owner, "Sender must be owner");
    //     wranglers[_address] = _is_active;
    //     emit ProtocolParameterUpdateNotification("wrangler_status", _address, _is_active?1:0);
    //     return true;
    // }

    function set_token_support(address _address, bool _is_active) public returns (bool) {
        require (msg.sender == owner, "Sender must be owner");
        supported_tokens[_address] = _is_active;
        emit ProtocolParameterUpdateNotification("token_support", _address, _is_active?1:0);
        return true;
    }

    // function lock_position(bytes32 _position_hash) internal {
    //     require (nonreentrant_locks[_position_hash] == false, "Position is already locked");
    //     nonreentrant_locks[_position_hash] = true;
    // }

    // function unlock_position(bytes32 _position_hash) internal {
    //     require  (nonreentrant_locks[_position_hash] == true, "Position is already unlocked");
    //     nonreentrant_locks[_position_hash] = false;
    // }

    function _noteCoderToStruct(bytes memory note) internal pure returns (Note memory codedNote) {
        (address _owner, bytes32 noteHash,) = note.extractNote();
        return Note(_owner, noteHash);
    }

    function record_position(address _lender, address _borrower, address _position_address) internal{
        // require (can_borrow(_borrower), "Borrower address cannot borrow");
        // require (can_lend(_lender), "Lender address canot lend");
        // borrow position
        borrow_positions_count[_borrower] += 1;
        borrow_position_index[_borrower][_position_address] = borrow_positions_count[_borrower];
        borrow_positions[_borrower][borrow_positions_count[_borrower]] = _position_address;
        // lend position
        lend_positions_count[_lender] += 1;
        lend_position_index[_lender][_position_address] = lend_positions_count[_lender];
        lend_positions[_lender][lend_positions_count[_lender]] = _position_address;
    }

    function remove_position(address _position_address) public {
        address _borrower = Position(_position_address).getBorrower();
        address _lender = Position(_position_address).getLender();
        // update borrow position indices
        uint256 _current_position_index = borrow_position_index[_borrower][_position_address];
        uint256 _last_position_index = borrow_positions_count[_borrower];
        address _last_position_address = borrow_positions[_borrower][_last_position_index];
        borrow_positions[_borrower][_current_position_index] = borrow_positions[_borrower][_last_position_index];
        borrow_positions[_borrower][_last_position_index] = address(0);
        borrow_position_index[_borrower][_position_address] = 0;
        borrow_position_index[_borrower][_last_position_address] = _current_position_index;
        borrow_positions_count[_borrower] -= 1;
        // update lend position indices
        _current_position_index = lend_position_index[_lender][_position_address];
        _last_position_index = lend_positions_count[_lender];
        _last_position_address = lend_positions[_lender][_last_position_index];
        lend_positions[_lender][_current_position_index] = lend_positions[_lender][_last_position_index];
        lend_positions[_lender][_last_position_index] = address(0);
        lend_position_index[_lender][_position_address] = 0;
        lend_position_index[_lender][_last_position_address] = _current_position_index;
        lend_positions_count[_lender] -= 1;
    }

    function open_position(
        address _kernel_creator,
        address[6] memory _addresses,
        bytes32[3] memory _noteHashes,
        uint256[4] memory _intValues, // nonce, monitoringFee, positionExpireDuration, approvalExpiresAt
        // uint256 _nonce,
        // uint256 _monitoring_fee,
        // uint256 _positionExpireDuration,
        // uint256 _approvalExpiresAt,
        bytes memory lendProof,
        bytes memory lendSign,
        bytes memory collateralProof,
        bytes memory collateralSign
    ) internal {
        Position _new_position = new Position(
            [_kernel_creator, _addresses[0], _addresses[1], _addresses[2], _addresses[3], _addresses[4], _addresses[5]],
            _noteHashes,
            [last_position_index, _intValues[0], _intValues[1], _intValues[3]]
        );

        address _new_position_address = address(_new_position);

        // _new_position_hash = Position(_new_position).getHash();
        // Position memory _new_position = Position({
        //     index: last_position_index,
        //     kernel_creator: _kernel_creator,
        //     lender: _addresses[0],
        //     borrower: _addresses[1],
        //     relayer: _addresses[2],
        //     wrangler: _addresses[3],
        //     created_at: block.timestamp,
        //     updated_at: block.timestamp,
        //     expires_at: block.timestamp + _intValues[2],
        //     borrow_currency_address: _addresses[4],
        //     lend_currency_address: _addresses[5],
        //     borrow_currency_noteHash: _noteHashes[0],
        //     lend_currency_filled_noteHash: _noteHashes[1], // Note to be transferred from lender to borrower
        //     lend_currency_owed_noteHash: _noteHashes[2],    // Dummy Note to be repayed by borrower to lender
        //     status: POSITION_STATUS_OPEN,
        //     nonce: _intValues[0],
        //     monitoring_fee: _intValues[1],
        //     hash: position_hash([_kernel_creator, _addresses[0], _addresses[1], _addresses[2],
        //     _addresses[3], _addresses[4], _addresses[5]], _noteHashes, [_intValues[0], _intValues[1]])
        // });

        // lock position_non_reentrant before loan creation
        // lock_position(_new_position.hash);
        // validate wrangler's activation status
        require(wranglers[_addresses[3]], "Wrangler not active");
        // validate wrangler's approval expiry
        require(_intValues[3] > block.timestamp, "Wrangler's approval expired");
        // validate wrangler's nonce
        require(_intValues[0] == wrangler_nonces[_addresses[3]][_kernel_creator] + 1, "Invalid nonce");
        // increment wrangler's nonce for kernel creator
        wrangler_nonces[_addresses[3]][_kernel_creator] += 1;
        // validate wrangler's signature
        // require (is_signer(_new_position.wrangler, _new_position.hash, _sig_data), "Incorrect signatures");
        // update position index
        position_index[last_position_index] = _new_position_address;
        last_position_index += 1;
        // positions[_new_position_hash] = _new_position;
        // record position
        record_position(_addresses[0], _addresses[1], _new_position_address);

        // Transfer collateral from borrower to contract
        (bytes memory _proofOutputs) = ACE(ZkERC20(_addresses[4]).getACE()).validateProof(JOIN_SPLIT_PROOF, address(this), collateralProof);
        (bytes memory _proofInputNotes, bytes memory _proofOutputNotes, ,) = _proofOutputs.get(0).extractProofOutput();
        require(_noteCoderToStruct(_proofOutputNotes.get(0)).noteHash == _noteHashes[0]);
        ZkERC20(_addresses[4]).confidentialApprove(_noteCoderToStruct(_proofInputNotes.get(0)).noteHash, address(this), true, collateralSign);
        ZkERC20(_addresses[4]).confidentialTransferFrom(JOIN_SPLIT_PROOF, _proofOutputs);

        // Transfer lend tokens from lender to borrower
        (_proofOutputs) = ACE(ZkERC20(_addresses[5]).getACE()).validateProof(JOIN_SPLIT_PROOF, address(this), lendProof);
        (_proofInputNotes, _proofOutputNotes, ,) = _proofOutputs.get(0).extractProofOutput();
        require(_noteCoderToStruct(_proofInputNotes.get(0)).noteHash == _noteHashes[1]);
        ZkERC20(_addresses[5]).confidentialApprove(_noteCoderToStruct(_proofInputNotes.get(0)).noteHash, address(this), true, lendSign);
        ZkERC20(_addresses[5]).confidentialTransferFrom(JOIN_SPLIT_PROOF, _proofOutputs);

        // transfer monitoring_fee from lender to wrangler
        bool token_transfer = ERC20( protocol_token_address).transferFrom(
            _addresses[0],
            _addresses[3],
            _intValues[1]
        );
        require(token_transfer);
        // notify wrangler that a position has been opened
        emit PositionUpdateNotification(_addresses[3], _new_position_address, "status",  POSITION_STATUS_OPEN);
        // unlock position_non_reentrant after loan creation
        // unlock_position(_new_position.hash);
    }

    function close_position(address _position_address, bytes memory repayProof, bytes memory repaySign, bytes memory returnCollateralProof) public returns (bool){
        Position existing_position = Position(_position_address);
        // confirm sender is borrower
        require(msg.sender == existing_position.getBorrower());
        // confirm position has not expired yet
        require(existing_position.expiresAt() >= block.timestamp);
        // confirm position is still active
        require(existing_position.getStatus() ==  POSITION_STATUS_OPEN);
        // lock position_non_reentrant before closure
        // lock_position(_position_hash);
        // perform closure
        existing_position.setStatus(POSITION_STATUS_CLOSED);
        // positions[_position_hash] = existing_position;
        remove_position(_position_address);

        // transfer lend_currency_owed_value from borrower to lender
        (bytes memory _proofOutputs) = ACE(ZkERC20(existing_position.getLendCurrencyAddress()).getACE()).validateProof(JOIN_SPLIT_PROOF, address(this), repayProof);
        (bytes memory _proofInputNotes, bytes memory _proofOutputNotes, ,) = _proofOutputs.get(0).extractProofOutput();
        require(_noteCoderToStruct(_proofInputNotes.get(0)).noteHash == existing_position.getLendCurrencyOwedNotehash());
        ZkERC20(existing_position.getLendCurrencyAddress()).confidentialApprove(_noteCoderToStruct(_proofInputNotes.get(0)).noteHash, address(this), true, repaySign);
        ZkERC20(existing_position.getLendCurrencyAddress()).confidentialTransferFrom(JOIN_SPLIT_PROOF, _proofOutputs);


        // transfer collateral back to borrower
        (_proofOutputs) = ACE(ZkERC20(existing_position.getBorrowCurrencyAddress()).getACE()).validateProof(JOIN_SPLIT_PROOF, address(this), returnCollateralProof);
        (_proofInputNotes, _proofOutputNotes, ,) = _proofOutputs.get(0).extractProofOutput();
        require(_noteCoderToStruct(_proofInputNotes.get(0)).noteHash == existing_position.getBorrowCurrencyNotehash());
        ZkERC20(existing_position.getBorrowCurrencyAddress()).confidentialApprove(_noteCoderToStruct(_proofInputNotes.get(0)).noteHash, address(this), true, '');
        ZkERC20(existing_position.getBorrowCurrencyAddress()).confidentialTransferFrom(JOIN_SPLIT_PROOF, _proofOutputs);


        // Notify wrangler that a position has been closed
        emit PositionUpdateNotification(existing_position.getWrangler(), address(existing_position), "status",  POSITION_STATUS_CLOSED);
        // unlock position_non_reentrant after closure
        // unlock_position(_position_hash);

        return true;
    }

    function fill_kernel(
        address[6] memory _addresses,
        // _addresses lender, borrower, relayer, wrangler, collateralToken, loanToken
        uint256[6] memory _intValues,
        // _intValues monitoringFeeLST, nonce, kernelDailyInterestRate, kernelExpiresAt, WranglerExpiresAt, positionDurationInSeconds
        bytes32[3] memory _noteHashes,
        // _noteHashes lendCurrencyNoteHash, borrowCurrencyNoteHash (expected collateral), lendCurrencyOwedNoteHash
        // uint256 _nonce,
        // uint256 _kernel_daily_interest_rate,
        bool _is_creator_lender,
        // uint256[2] memory _timestamps,
        // kernel_expires_at, wrangler_approval_expires_at
        // uint256 _position_duration_in_seconds,
        // loanDuration
        bytes32 _kernel_creator_salt,
        // bytes memory _sig_data_kernel_creator,
        // bytes memory _sig_data_wrangler,
        bytes memory lendProof,
        bytes memory lendSign,
        bytes memory collateralProof,
        bytes memory collateralSign
        // v, r, s of kernel_creator and wrangler
        ) public returns (bool){

            // validate _collateralToken is a contract address
            require(supported_tokens[_addresses[4]]);
            // validate _loanToken is a contract address
            require(supported_tokens[_addresses[5]]);
            Kernel(kernel_address).fill(_addresses, _intValues, _noteHashes, _is_creator_lender, _kernel_creator_salt);
            // validate kernel_creator's signature
            // require(is_signer(_kernel_creator, _k_hash, _sig_data_kernel_creator));
            // validate loan amount to be filled
            // require(_kernel.lend_currency_offered_value - filled_or_cancelled_loan_amount(_k_hash) >=_values[6]);
            // fill offer with lending currency
            
            
            // open position
            
            // open_position(
            //     _kernel_creator, _addresses, _intValues,
            //     _nonce, _kernel_daily_interest_rate,
            //     _position_duration_in_seconds, _timestamps[1], _sig_data_wrangler
            // );
            open_position(
                _is_creator_lender ? _addresses[0]: _addresses[1],
                _addresses,
                _noteHashes,
                [_intValues[1], _intValues[0], _intValues[5], _intValues[4]],
                lendProof, lendSign,
                collateralProof, collateralSign
            );

            // transfer relayerFeeLST from kernel creator to relayer
            // if((_kernel.relayer != address(0)) && (_kernel.relayer_fee > 0)){
            //     bool token_transfer = ERC20( protocol_token_address).transferFrom(
            //         _kernel_creator,
            //         _kernel.relayer,
            //         _kernel.relayer_fee
            //     );
            //     require(token_transfer);
            // }
            return true;
    }

    function cancel_kernel(
        address[6] memory _addresses, bytes32[2] memory _noteHashes, uint256[5] memory _intValues, bytes32 _kernel_creator_salt) public returns (bool){
            Kernel(kernel_address).cancel(_addresses, _noteHashes, _intValues, _kernel_creator_salt);

            return true;
    }
}