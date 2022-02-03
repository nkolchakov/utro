//SPDX-License-Identifier: Unlicense

pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

struct Schedule {
    uint256 scheduleId;
    uint256 stakedEth;
    uint256 periodDays;
    address[] participants;
}

struct AnswerData {
    address[] participants;
    // convetion would be to be sorted
    bytes[] signatures;
    bytes32[] answers;
}

// Utro (bulgarian, Утро) = Morning
contract Utro {
    using ECDSA for bytes32;
    uint256 public scheduleId = 0;

    mapping(address => Schedule) public participantToScheduleId;
    mapping(uint256 => Schedule) public scheduleIdToSchedule;

    function verify(
        string memory _answer,
        string memory _secret,
        address _signer,
        bytes memory _signature
    ) public pure returns (bool) {
        bytes32 messageHash = getMessageHash(_answer, _secret);
        bytes32 ethSignedMessageHash = getEthSignedMessageHash(messageHash);

        return ethSignedMessageHash.recover(_signature) == _signer;
    }

    function getMessageHash(string memory _answer, string memory _secret)
        public
        pure
        returns (bytes32)
    {
        return keccak256(abi.encodePacked(_answer, _secret));
    }

    function getEthSignedMessageHash(bytes32 _messageHash)
        public
        pure
        returns (bytes32)
    {
        return
            keccak256(
                abi.encodePacked(
                    "\x19Ethereum Signed Message:\n32",
                    _messageHash
                )
            );
    }
}
