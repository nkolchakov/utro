//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

enum ScheduleStatus {
    PENDING,
    ACTIVE,
    CLOSED
}

// vertical structure of the data
struct AnswerData {
    address[] participants;
    bytes[] signatures;
    string[] answers1;
    string[] answers2;
    string[] gameKeys;
}

struct Schedule {
    string name;
    uint256 id;
    uint256 stakeRequired;
    uint256 totalStakedEth;
    uint256 daysNumber;
    uint256 activationTimestamp;
    uint256 hour;
    uint256 lastCalledTimesamp;
    ScheduleStatus status;
}

// Utro (bulgarian, Утро) = Morning
contract Utro {
    using ECDSA for bytes32;

    event ScheduleCreated(
        uint256 scheduleId,
        address creator,
        uint256 participantOrder
    );
    event ParticipantJoined(
        address participant,
        uint256 scheduleId,
        uint256 participantOrder
    );
    event ScheduleActivated(uint256 scheduleId, uint256 activationTimestamp);
    event Slashed(uint256 scheduleId, address participant);
    event Payback(uint256 scheduleId, address participant, uint256 value);

    event debugParams(string str, AnswerData data);

    uint256 public constant maxParticipantsPerSchedule = 10;
    uint256 public scheduleIterativeId = 1;

    /* Providing the participants from each schedule after the quiz,
    they will be sorted when queried from the helping db, based on this counter
    order is important to match them with this original array of participants
    */
    uint256 public participantOrder = 0;

    // 1st participant is the owner
    mapping(uint256 => address[]) public scheduleIdToParticipants;
    mapping(uint256 => Schedule) public scheduleIdToSchedule;
    mapping(uint256 => uint256) public scheduleIdToSurvivorsCount;
    mapping(address => uint256) public participantToScheduleId;

    function dailyCheck(uint256 _scheduleId, AnswerData calldata _data)
        public
        scheduleExists(_scheduleId)
    {
        Schedule storage schedule = scheduleIdToSchedule[_scheduleId];

        // TODO: uncomment after testing
        // require(
        //     schedule.lastCalledTimesamp + 24 hours >= block.timestamp,
        //     "Already was called for the day"
        // );
        require(
            schedule.status == ScheduleStatus.ACTIVE,
            "Schedule should be active !"
        );

        // second index for the answer data
        uint256 adId = 0;
        address[] memory ps = scheduleIdToParticipants[_scheduleId];
        for (uint256 i = 0; i < ps.length; i++) {
            if (ps[i] == address(0)) {
                continue;
            }
            if (adId >= _data.participants.length) {
                // all participatns from the quiz are iterated,
                // slash everyone from that index to the end
                for (uint256 j = i; j < ps.length; j++) {
                    slash(_scheduleId, j);
                }
                break;
            }

            // TODO: optimize by comparing addresses ? to skip before iterating all
            if (ps[i] != _data.participants[adId]) {
                // this address should have been participating, but skipped
                // need to slash !
                slash(_scheduleId, i);
                continue;
            }

            // verify signature
            bool isSignatureValid = verifySignature(
                _data.answers1[adId],
                _data.answers2[adId],
                _data.gameKeys[adId],
                _data.participants[adId],
                _data.signatures[adId]
            );
            adId++;

            if (!isSignatureValid) {
                // sloppy answers, slash !
                slash(_scheduleId, i);
            }
        }

        schedule.lastCalledTimesamp = block.timestamp;

        // check if it's the last day of the schedule
        // TODO: removea after testing
        if (true || schedule.activationTimestamp + 30 days >= block.timestamp) {
            // it's over, congratulations to the dedicated ones !
            schedule.status = ScheduleStatus.CLOSED;
            if (scheduleIdToSurvivorsCount[_scheduleId] != 0) {
                // return stakes + slashes from the falied ones
                uint256 refundPerPerson = schedule.totalStakedEth /
                    scheduleIdToSurvivorsCount[_scheduleId];
                for (uint256 i = 0; i < ps.length; i++) {
                    if (
                        scheduleIdToParticipants[_scheduleId][i] == address(0)
                    ) {
                        continue;
                    }
                    (bool success, ) = payable(
                        scheduleIdToParticipants[_scheduleId][i]
                    ).call{value: refundPerPerson}("");
                    if (success) {
                        emit Payback(
                            _scheduleId,
                            scheduleIdToParticipants[_scheduleId][i],
                            refundPerPerson
                        );
                    }
                }
            }

            delete scheduleIdToSchedule[_scheduleId];
            delete scheduleIdToParticipants[_scheduleId];
        }
    }

    function slash(uint256 _scheduleId, uint256 _participantIndex) private {
        // forget the ones who fail, won't be elligible for the refund
        if (
            scheduleIdToParticipants[_scheduleId][_participantIndex] ==
            address(0)
        ) {
            // already been slashed !
            return;
        }
        emit Slashed(
            _scheduleId,
            scheduleIdToParticipants[_scheduleId][_participantIndex]
        );
        scheduleIdToParticipants[_scheduleId][_participantIndex] = address(0);
        scheduleIdToSurvivorsCount[_scheduleId]--;
    }

    function verifySignature(
        string memory _a1,
        string memory _a2,
        string memory _gameKey,
        address _signer,
        bytes memory _signature
    ) public pure returns (bool) {
        bytes32 messageHash = keccak256(abi.encodePacked(_a1, _a2, _gameKey));
        bytes32 ethSignedMessageHash = messageHash.toEthSignedMessageHash();

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
        // there is no schedule with id 0, it started from
        Schedule[] memory result = new Schedule[](scheduleIterativeId - 1);
        for (uint256 i = 1; i < scheduleIterativeId; i++) {
            result[i - 1] = scheduleIdToSchedule[i];
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
            "[create] Provided stake is less than the required for the schedule!"
        );

        scheduleIdToSchedule[scheduleIterativeId] = Schedule({
            name: _name,
            id: scheduleIterativeId,
            stakeRequired: _stakeRequired,
            totalStakedEth: msg.value,
            status: ScheduleStatus.PENDING,
            daysNumber: daysNumber,
            activationTimestamp: 0,
            lastCalledTimesamp: 0,
            hour: _hour
        });
        scheduleIdToParticipants[scheduleIterativeId].push(msg.sender);
        participantToScheduleId[msg.sender] = scheduleIterativeId;

        scheduleIterativeId++;
        participantOrder++;
        emit ScheduleCreated(
            scheduleIterativeId - 1,
            msg.sender,
            participantOrder - 1
        );
    }

    function joinSchedule(uint256 _scheduleId)
        public
        payable
        scheduleExists(_scheduleId)
    {
        Schedule storage schedule = scheduleIdToSchedule[_scheduleId];
        require(
            schedule.status == ScheduleStatus.PENDING,
            "You can join schedule only if it's Pending!"
        );
        require(
            scheduleIdToParticipants[_scheduleId].length <
                maxParticipantsPerSchedule,
            "Participant max count is reached !"
        );
        require(
            participantToScheduleId[msg.sender] != _scheduleId,
            "You already joined the schedule !"
        );
        require(
            msg.value >= schedule.stakeRequired,
            "[join] Provided stake is less than required for the schedule!"
        );

        schedule.totalStakedEth += msg.value;

        scheduleIdToParticipants[schedule.id].push(msg.sender);
        participantToScheduleId[msg.sender] = schedule.id;
        participantOrder++;
        emit ParticipantJoined(msg.sender, schedule.id, participantOrder - 1);
    }

    function activateSchedule(uint256 _scheduleId)
        public
        scheduleExists(_scheduleId)
    {
        Schedule storage schedule = scheduleIdToSchedule[_scheduleId];
        require(
            schedule.status == ScheduleStatus.PENDING,
            "Only schedules with PENDING status can be activated !"
        );
        require(
            scheduleIdToParticipants[_scheduleId].length > 1,
            "Cannot activate a schedule w/ less than 2 peeople !"
        );
        require(
            scheduleIdToParticipants[_scheduleId][0] == msg.sender,
            "Only owner can activate !"
        );

        schedule.status = ScheduleStatus.ACTIVE;
        schedule.activationTimestamp = block.timestamp;

        // start with fresh count of non-slashed participants
        scheduleIdToSurvivorsCount[_scheduleId] = scheduleIdToParticipants[
            _scheduleId
        ].length;

        emit ScheduleActivated(_scheduleId, schedule.activationTimestamp);
    }

    modifier scheduleExists(uint256 _scheduleId) {
        bytes memory scheduleNameBytes = bytes(
            scheduleIdToSchedule[_scheduleId].name
        );
        require(scheduleNameBytes.length > 0, "Schedule does not exist !");
        _;
    }
}
