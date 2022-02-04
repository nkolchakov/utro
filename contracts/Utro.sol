//SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

enum ScheduleStatus {
    PENDING,
    ACTIVE,
    CLOSED
}

struct AnswerData {
    address[] participants;
    // convetion would be to be sorted
    bytes[] signatures;
    bytes32[] answers;
}

struct Schedule {
    string name;
    uint256 id;
    uint256 stakeRequired;
    uint256 totalStakedEth;
    ScheduleStatus status;
    uint256 endDate;
}

// Utro (bulgarian, Утро) = Morning
contract Utro {
    using ECDSA for bytes32;

    event ParticipantJoined(address participant, uint256 scheduleId);

    uint256 public maxParticipantsPerSchedule = 10;
    uint256 public scheduleIterativeId = 0;

    mapping(address => uint256) public participantToScheduleId;

    mapping(uint256 => Schedule) public scheduleIdToSchedule;
    mapping(uint256 => address[]) public scheduleIdToParticipants;

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

    function getParticipants(uint256 _scheduleId)
        public
        view
        returns (address[] memory)
    {
        return scheduleIdToParticipants[_scheduleId];
    }

    function createSchedule(
        string memory _name,
        uint256 _stakeRequired,
        uint256 _endDate
    ) public payable {
        require(bytes(_name).length > 0, "Name cannot be empty !");
        require(
            msg.value >= _stakeRequired,
            "Provided stake is less than the required for the schedule!"
        );

        scheduleIdToSchedule[scheduleIterativeId] = Schedule({
            name: _name,
            id: scheduleIterativeId,
            stakeRequired: _stakeRequired,
            totalStakedEth: msg.value,
            status: ScheduleStatus.PENDING,
            endDate: _endDate
        });
        scheduleIdToParticipants[scheduleIterativeId].push(msg.sender);
        participantToScheduleId[msg.sender] = scheduleIterativeId;

        scheduleIterativeId++;
    }

    function joinSchedule(uint256 _scheduleId) public payable {
        Schedule storage schedule = scheduleIdToSchedule[_scheduleId];
        bytes memory scheduleNameBytes = bytes(schedule.name);
        require(
            msg.value >= schedule.stakeRequired,
            "Provided stake is less than required for the schedule!"
        );
        require(scheduleNameBytes.length != 0, "Schedule does not exist !");
        require(
            schedule.status == ScheduleStatus.PENDING,
            "You can join schedule if it is only pending!"
        );
        require(
            scheduleIdToParticipants[_scheduleId].length <
                maxParticipantsPerSchedule
        );
        schedule.totalStakedEth += msg.value;

        scheduleIdToParticipants[schedule.id].push(msg.sender);
        participantToScheduleId[msg.sender] = scheduleIterativeId;
        emit ParticipantJoined(msg.sender, schedule.id);
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
