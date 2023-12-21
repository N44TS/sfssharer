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
  const [timeLeft, setTimeLeft] = useState({
    days: "00",
    hours: "00",
    minutes: "00",
  });

  // Temporary variable for development (set to 'true' to simulate being a winner)
  const [isTempWinner, setIsTempWinner] = useState(false); // Change to true to test winner view


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

  // Temporary!!! function to toggle winner status (for development)
  const toggleWinnerStatus = () => {
    setIsTempWinner(!isTempWinner);
  };

  // Handle claim reward // STILL NEEDS DOING!!
  // const handleClaimReward = () => {
  //   // Add logic to claim the reward
  //   console.log("Reward claimed");
  //   setShowWinningAnimation(false); // Hide animation after claiming
  // };

  return (
    <div className="app-container">
      {/* Temporary!!! button to toggle winner status */}
    <button onClick={toggleWinnerStatus}>Toggle Winner Status (Dev)</button>
           {/* {isWinner && (
            <section className="claim-reward">
              <button onClick={claimReward} className="claim-button">
                Claim Your Reward
              </button>
            </section>
          )} */}
       {/* Check if user is a winner */}
       {isTempWinner && (
       <div className="winning-animation">
       <div className="winning-message">You Won!
       <p>yes, srsly....</p>
       <button onClick={claimReward} className="claim-button">get my money</button>
    </div>
     </div>
      )}

      <div className="wallet-address">
        {account && (
          <p>
            Connected: {account.substring(0, 4)}...
            {account.substring(account.length - 5)}
          </p>
        )}
      </div>
      <div className="gamble-box">
        <header className="app-header">
          <h1 className="app-title">Gumbledapp</h1>
          <div className="countdown-timer">
            <p>Time left to play</p>
            <span className="timer-days">00</span>d :
            <span className="timer-hours">00</span>h :
            <span className="timer-minutes">00</span>m
          </div>
          {isAdmin && <div className="admin-button">Admin</div>}
        </header>

        <main className="main-content">
          <div className="prediction-section">
            <h2 className="section-title">This Week's Gumble</h2>
            <div className="prediction-input-wrapper">
              <input
                type="number"
                value={prediction}
                onChange={(e) => setPrediction(e.target.value)}
                className="prediction-input"
                placeholder="predict MILADY floor price on nye"
              />
              <button onClick={submitPrediction} className="submit-button">
                Submit
              </button>
            </div>
            {/* *pay gas only */}
          </div> 

          {isAdmin && (
            <section className="admin-panel">
              {/* Admin panel inputs and buttons */}
            </section>
          )}
        </main>
      </div>

      <div className="rules-section">
        <div className="rules">
          <h3 className="rules-title">
            Rules: closest to actual price after 2 weeks wins a share of the
            contract fees(SFS)! . The more people interact with this contract,
            the more Eth to be won!
          </h3>
          {/* Rules text here */}
        </div>
      </div>
    </div>
  );
}

export default App;
