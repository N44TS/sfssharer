import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import abi from "./utils/abi.json";
import "./App.css";

const contractAddress = "0x459d998241FA8C9FC71fbeed228c3CA4c4e2a055";

function App() {
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [prediction, setPrediction] = useState("");
  const [winningNumber, setWinningNumber] = useState("");
  const [sfsFeeAmount, setSfsFeeAmount] = useState("");
  const [isWinner, setIsWinner] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contractInstance = new ethers.Contract(
          contractAddress,
          abi,
          signer
        );

        setContract(contractInstance);

        try {
          const userAccount = await signer.getAddress();
          setAccount(userAccount);
          const adminAddress = await contractInstance.admin();
          setIsAdmin(adminAddress.toLowerCase() === userAccount.toLowerCase());
        } catch (error) {
          console.error("Error during initialization:", error);
        }
      } else {
        console.error("Ethereum object not found, install MetaMask.");
      }
    };

    init();
    checkIfWinner(); // Call the function to check if the user is a winner
  }, [account, contract]); // Depend on account and contract

  const checkIfWinner = async () => {
    if (contract && account) {
      try {
        const position = await contract.winnerPosition(account);
        setIsWinner(position > 0); // Set isWinner to true if the user's position is greater than 0
      } catch (error) {
        console.error("Error checking winner status:", error);
      }
    }
  };

  const checkIfAdmin = async (userAccount) => {
    try {
      const adminAddress = await contract.admin(); // Use contract directly
      setIsAdmin(adminAddress.toLowerCase() === userAccount.toLowerCase());
      console.log("Is Admin:", isAdmin);
    } catch (error) {
      console.error("Error checking admin status:", error);
    }
  };

  const submitPrediction = async () => {
    if (!prediction) return;
    try {
      await contract.submitPrediction(prediction);
      console.log(`Prediction ${prediction} submitted`);
    } catch (error) {
      console.error("Error submitting prediction:", error);
    }
  };

  const claimReward = async () => {
    try {
      await contract.claimReward();
      console.log("Reward claimed");
    } catch (error) {
      console.error("Error claiming reward:", error);
    }
  };

  const setWinningNum = async () => {
    if (!winningNumber) return;
    try {
      await contract.setWinningNumber(winningNumber);
      console.log(`Winning number set to ${winningNumber}`);
    } catch (error) {
      console.error("Error setting winning number:", error);
    }
  };

  const claimSFSFees = async () => {
    if (!sfsFeeAmount) return;
    try {
      await contract.claimSFSFees(sfsFeeAmount);
      console.log(`SFS fees claimed: ${sfsFeeAmount}`);
    } catch (error) {
      console.error("Error claiming SFS fees:", error);
    }
  };

  return (
    <div className="app-container">
      <h1 className="header">GumbleDapp</h1>
      <h2 className="description">
        Predict the Milady NFT floor price - win rewards!
      </h2>
      <h4>
        rules: cloest to actual price after 2 weeks wins a share of the contract
        fees(SFS)! . The more people interact with this contract, the more Eth
        to be won!
      </h4>

      {/* Prediction Input */}
      <div className="section">
        <input
          type="number"
          value={prediction}
          className="input-field"
          onChange={(e) => setPrediction(e.target.value)}
          placeholder="Your Prediction"
        />
        <button onClick={submitPrediction} className="button">
          Submit
        </button>
      </div>

      {/* Claim Reward */}
      {isWinner && (
        <div className="section">
          <button onClick={claimReward} className="button">
            Claim Reward
          </button>
        </div>
      )}

      {/* Admin Panel */}
      {isAdmin && (
        <div className="section">
          <input
            type="number"
            value={winningNumber}
            className="input-field"
            onChange={(e) => setWinningNumber(e.target.value)}
            placeholder="Set Winning Number"
          />
          <button onClick={setWinningNum} className="button">
            Set Winning Number
          </button>
          <input
            type="number"
            value={sfsFeeAmount}
            className="input-field"
            onChange={(e) => setSfsFeeAmount(e.target.value)}
            placeholder="SFS Fee Amount"
          />
          <button onClick={claimSFSFees} className="button">
            Claim SFS Fees
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
