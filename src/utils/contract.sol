// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// to talk to the Fee Sharing Contract
interface IFeeSharing {
    function assign(uint256 _tokenId) external;

    function withdraw(
        uint256 _tokenId,
        address payable _recipient,
        uint256 _amount
    ) external returns (uint256);

    function getTokenId(address _smartContract) external view returns (uint256);

    function isRegistered(address _smartContract) external view returns (bool);

    function getBalanceUpdatedBlock(
        address _smartContract
    ) external view returns (uint256);

    function balances(uint256 tokenId) external view returns (uint256);
}

contract SFSFractioniser {
    struct Prediction {
        address predictor;
        uint256 predictedNumber;
    }

    Prediction[] public predictions;
    uint256 public winningNumber;
    address public admin;
    mapping(address => uint256) public winnerPosition;

    IFeeSharing public feeSharingContract;
    uint256 public sfsTokenId;

    event PredictionSubmitted(
        address indexed predictor,
        uint256 predictedNumber
    );
    event WinnersDetermined(
        address indexed firstPlace,
        address indexed secondPlace,
        address indexed thirdPlace
    );
    event RewardClaimed(address indexed winner, uint256 amount);
    event WinningNumberSet(uint256 winningNumber);
    event GameReset();

    // the Fee Sharing Contract address and SFS token ID in order to assign this contract to sfs nft
    constructor(address _feeSharingContractAddress, uint256 _sfsTokenId) {
        admin = msg.sender;
        feeSharingContract = IFeeSharing(_feeSharingContractAddress);
        sfsTokenId = _sfsTokenId;
        // Assign an existing tokenId to this contract
        feeSharingContract.assign(sfsTokenId);
    }

    // Function to allow users to submit predictions
    function submitPrediction(uint256 _predictedNumber) external {
        predictions.push(Prediction(msg.sender, _predictedNumber));
        emit PredictionSubmitted(msg.sender, _predictedNumber);
    }

    // Function to get the total number of predictions
    function getTotalPredictions() external view returns (uint256) {
        return predictions.length;
    }

    // Function for the admin to set the winning number
    function setWinningNumber(uint256 _winningNumber) external {
        require(msg.sender == admin, "Only admin can set the winning number");
        winningNumber = _winningNumber;
        determineWinners();
        emit WinningNumberSet(_winningNumber);
    }

    // Internal function to determine the top three closest predictions
    function determineWinners() private {
        require(predictions.length >= 3, "Not enough predictions");
        // Simple-ish algorithm to find the top 3 closest predictions
        uint256[3] memory closest;
        uint256[3] memory closestDiff = [
            type(uint256).max,
            type(uint256).max,
            type(uint256).max
        ];

        for (uint i = 0; i < predictions.length; i++) {
            uint256 diff = abs(predictions[i].predictedNumber, winningNumber);

            for (uint j = 0; j < 3; j++) {
                if (diff < closestDiff[j]) {
                    for (uint k = 2; k > j; k--) {
                        closest[k] = closest[k - 1];
                        closestDiff[k] = closestDiff[k - 1];
                    }
                    closest[j] = i;
                    closestDiff[j] = diff;
                    break;
                }
            }
        }

        for (uint i = 0; i < 3; i++) {
            winnerPosition[predictions[closest[i]].predictor] = i + 1;
        }

        emit WinnersDetermined(
            predictions[closest[0]].predictor,
            predictions[closest[1]].predictor,
            predictions[closest[2]].predictor
        );
    }

    // Function for winners to claim their rewards
    function claimReward() external {
        uint256 position = winnerPosition[msg.sender];
        // requires them to be 1, 2 or 3 anyone else is 0
        require(position > 0, "Not a winner");

        uint256 reward;
        uint256 totalReward = address(this).balance;

        if (position == 1) {
            // 50% for 1st place
            reward = totalReward / 2;
        } else if (position == 2) {
            // 30% for 2nd place
            reward = (totalReward * 30) / 100;
        } else if (position == 3) {
            // 20% for 3rd place
            reward = (totalReward * 20) / 100;
        }

        payable(msg.sender).transfer(reward);
        winnerPosition[msg.sender] = 0; // Reset winner position after claiming
        emit RewardClaimed(msg.sender, reward);
    }

    // Function to check the registration status of the contract with the Fee Sharing Contract to make sure its getting sfs
    function checkRegistrationAndBalanceBlock()
        external
        view
        returns (bool, uint256)
    {
        bool isRegistered = feeSharingContract.isRegistered(address(this));
        uint256 balanceBlock = feeSharingContract.getBalanceUpdatedBlock(
            address(this)
        );
        return (isRegistered, balanceBlock);
    }

    // Internal function to calculate the absolute difference between two numbers
    function abs(uint256 a, uint256 b) private pure returns (uint256) {
        return a >= b ? a - b : b - a;
    }

    // Function for the admin to claim SFS fees
    function claimSFSFees(uint256 amount) external {
        require(msg.sender == admin, "Only admin can claim SFS fees");
        //withdraws to this contracts address
        feeSharingContract.withdraw(sfsTokenId, payable(address(this)), amount);
    }

    // Function to reset the game (admin-only)
    function resetGame() public {
        require(msg.sender == admin, "Only admin can reset the game");

        // Clear the predictions array
        delete predictions;

        // Reset the winning number
        winningNumber = 0;

        // Reset winner positions for all addresses
        for (uint256 i = 0; i < predictions.length; i++) {
            delete winnerPosition[predictions[i].predictor];
        }

        // Emit the GameReset event
        emit GameReset();
    }

    // FUTURE FUNCTIONALITY to check the accumulated fees
    function checkAccumulatedFees() external view returns (uint256) {
        return feeSharingContract.balances(sfsTokenId);
    }
}
