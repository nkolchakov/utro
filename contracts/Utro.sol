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
    uint256 daysNumber;
    uint256 activationTimestamp;
    uint256 hour;
    ScheduleStatus status;
}

// Utro (bulgarian, Утро) = Morning
contract Utro {
    using ECDSA for bytes32;

    event ScheduleCreated(uint256 scheduleId, address creator);
    event ParticipantJoined(address participant, uint256 scheduleId);
    event ScheduleActivated(uint256 scheduleId, uint256 activationTimestamp);

    uint256 public constant maxParticipantsPerSchedule = 10;
    uint256 public scheduleIterativeId = 0;

    mapping(address => uint256) public participantToScheduleId;

    mapping(uint256 => Schedule) public scheduleIdToSchedule;

    // 1st participant is the owner
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

    function getSchedules() public view returns (Schedule[] memory) {
        Schedule[] memory result = new Schedule[](scheduleIterativeId);
        for (uint256 i = 0; i < scheduleIterativeId; i++) {
            result[i] = scheduleIdToSchedule[i];
        }
        return result;
    }

    function createSchedule(
        string memory _name,
        uint256 _stakeRequired,
        uint256 daysNumber,
        uint256 _hour
    ) public payable {
        require(bytes(_name).length > 0, "Name cannot be empty !");
        require(
            msg.value >= _stakeRequired,
            "Provided stake is less than the required for the schedule!"
        );
        require(daysNumber >= 30, "Lowest period to participate is 30 days");

        scheduleIdToSchedule[scheduleIterativeId] = Schedule({
            name: _name,
            id: scheduleIterativeId,
            stakeRequired: _stakeRequired,
            totalStakedEth: msg.value,
            status: ScheduleStatus.PENDING,
            daysNumber: daysNumber,
            activationTimestamp: 0,
            hour: _hour
        });
        scheduleIdToParticipants[scheduleIterativeId].push(msg.sender);
        participantToScheduleId[msg.sender] = scheduleIterativeId;

        scheduleIterativeId++;
        emit ScheduleCreated(scheduleIterativeId - 1, msg.sender);
    }

    function joinSchedule(uint256 _scheduleId)
        public
        payable
        scheduleExists(_scheduleId)
    {
        Schedule storage schedule = scheduleIdToSchedule[_scheduleId];
        require(
            msg.value >= schedule.stakeRequired,
            "Provided stake is less than required for the schedule!"
        );
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

    function activateSchedule(uint256 _scheduleId)
        public
        scheduleExists(_scheduleId)
    {
        Schedule storage schedule = scheduleIdToSchedule[_scheduleId];
        require(
            scheduleIdToParticipants[_scheduleId].length > 1,
            "Cannot activate a schedule w/ less than 2 peeople !"
        );
        require(
            schedule.status != ScheduleStatus.ACTIVE ||
                schedule.status != ScheduleStatus.CLOSED,
            "Only schedules with PENDING status can be activated !"
        );

        schedule.status = ScheduleStatus.ACTIVE;
        schedule.activationTimestamp = block.timestamp;

        emit ScheduleActivated(_scheduleId, schedule.activationTimestamp);
    }

    modifier scheduleExists(uint256 _scheduleId) {
        Schedule memory schedule = scheduleIdToSchedule[_scheduleId];
        bytes memory scheduleNameBytes = bytes(schedule.name);
        require(scheduleNameBytes.length != 0, "Schedule does not exist !");
        _;
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
