// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SFSFractionizer {
    struct Prediction {
        address predictor;
        uint256 predictedPrice;
    }

    Prediction[] public predictions;
    uint256 public actualPrice;
    address public admin;
    mapping(address => uint256) public winnerPosition; // Store winner positions

    // Events
    event PredictionSubmitted(
        address indexed predictor,
        uint256 predictedPrice
    );
    event WinnersDetermined(
        address indexed firstPlace,
        address indexed secondPlace,
        address indexed thirdPlace
    );
    event RewardClaimed(address indexed winner, uint256 amount);
    event ActualPriceSet(address indexed admin, uint256 actualPrice);

    constructor() {
        admin = msg.sender;
    }

    function submitPrediction(uint256 _predictedPrice) external {
        predictions.push(Prediction(msg.sender, _predictedPrice));
        emit PredictionSubmitted(msg.sender, _predictedPrice);
    }

    function setActualPrice(uint256 _actualPrice) external {
        require(msg.sender == admin, "Only admin can set the price");
        actualPrice = _actualPrice;
        determineWinners();
    }

    function abs(int256 x) internal pure returns (uint256) {
        return x >= 0 ? uint256(x) : uint256(-x);
    }

    function determineWinners() private {
        require(predictions.length >= 3, "Not enough predictions");

        // Sorting predictions based on the absolute difference from actual price
        for (uint i = 0; i < predictions.length; i++) {
            for (uint j = i + 1; j < predictions.length; j++) {
                if (
                    abs(
                        int256(predictions[i].predictedPrice) -
                            int256(actualPrice)
                    ) >
                    abs(
                        int256(predictions[j].predictedPrice) -
                            int256(actualPrice)
                    )
                ) {
                    // Swap predictions
                    Prediction memory temp = predictions[i];
                    predictions[i] = predictions[j];
                    predictions[j] = temp;
                }
            }
        }

        // Mark top 3 predictions as winners and store their positions
        for (uint i = 0; i < 3; i++) {
            if (i == 0) {
                winnerPosition[predictions[i].predictor] = 1; // First place
            } else if (i == 1) {
                winnerPosition[predictions[i].predictor] = 2; // Second place
            } else if (i == 2) {
                winnerPosition[predictions[i].predictor] = 3; // Third place
            }
        }

        emit WinnersDetermined(
            predictions[0].predictor,
            predictions[1].predictor,
            predictions[2].predictor
        );
    }

    function claimReward() external {
        require(winnerPosition[msg.sender] > 0, "You are not a winner");
        uint256 totalReward = address(this).balance / 2; // Half of the contract's balance
        uint256 rewardAmount;

        if (winnerPosition[msg.sender] == 1) {
            rewardAmount = (totalReward * 50) / 100; // 50% for 1st place
        } else if (winnerPosition[msg.sender] == 2) {
            rewardAmount = (totalReward * 30) / 100; // 30% for 2nd place
        } else if (winnerPosition[msg.sender] == 3) {
            rewardAmount = (totalReward * 20) / 100; // 20% for 3rd place
        }

        // Transfer reward to the winner
        payable(msg.sender).transfer(rewardAmount);
        emit RewardClaimed(msg.sender, rewardAmount);
        winnerPosition[msg.sender] = 0; // Reset winner position after claiming
    }
    // Additional functions for SFS NFT interactions can be added here
}
