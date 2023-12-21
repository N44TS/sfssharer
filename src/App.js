import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import abi from "./utils/abi.json";
import "./App.css";
import CountdownTimer from "./CountdownTimer";

const contractAddress = "0x459d998241FA8C9FC71fbeed228c3CA4c4e2a055";

function App() {
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [prediction, setPrediction] = useState("");
  const [winningNumber, setWinningNumber] = useState("");
  const [sfsFeeAmount, setSfsFeeAmount] = useState("");
  const [isWinner, setIsWinner] = useState(false);
  const [showRegistrationStatus, setShowRegistrationStatus] = useState(false);
  const [isContractRegistered, setIsContractRegistered] = useState(null);
  const [showWinningAnimation, setShowWinningAnimation] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: "00",
    hours: "00",
    minutes: "00",
  });

  // Temporary variable for development (set to 'true' to simulate being a winner)
  // const [isTempWinner, setIsTempWinner] = useState(false); // Change to true to test winner view

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
          console.log(
            "Hey babes, come here often?... looks around the console...passes you a red wine..."
          );
          const adminAddress = await contractInstance.admin();
          setIsAdmin(adminAddress.toLowerCase() === userAccount.toLowerCase()); // Check if the logged-in user is admin
          checkIfWinner(userAccount); // Check if the logged-in user is a winner
        } catch (error) {
          console.error("Error during initialization:", error);
        }
      } else {
        console.error("Ethereum object not found, install MetaMask.");
      }
    };

    init();
    checkIfWinner();
  }, [account, contract]); // Depend on account and contract

  const checkIfWinner = async () => {
    if (contract && account) {
      try {
        const position = await contract.winnerPosition(account);
        const isWinnerNow = position > 0;
        setIsWinner(isWinnerNow);
        setShowWinningAnimation(isWinnerNow); // Trigger the animation if the user is a winner
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
      setShowWinningAnimation(false); // Hide the winning animation after claiming
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
    const amount = parseFloat(sfsFeeAmount); // Convert string to a floating-point number
    if (isNaN(amount) || amount <= 0) {
      console.error("Invalid SFS fee amount.");
      return; // Exit the function if the amount is not a valid number or less than or equal to zero
    }
    try {
      await contract.claimSFSFees(sfsFeeAmount);
      console.log(`SFS fees claimed: ${sfsFeeAmount}`);
    } catch (error) {
      console.error("Error claiming SFS fees:", error);
    }
  };

  const checkContractRegistration = async () => {
    try {
      const [isRegistered, balanceBlock] =
        await contract.checkRegistrationAndBalanceBlock();
      setIsContractRegistered(isRegistered);
      setShowRegistrationStatus(true);
      // Optionally, you can also handle balanceBlock if needed
    } catch (error) {
      console.error("Error checking contract registration:", error);
    }
  };

  ////////////////////////////////
  ////////BRING IN THE RETURN////////////////
  ////////////////////////////////
  return (
    <div className="app-container">
      {/* Admin panel stuff */}
      {isAdmin && (
        <section className="admin-panel">
          <h2>Admin Panel</h2>
          <div className="admin-item">
            <label>Contract Registered?:</label>
            {!showRegistrationStatus && (
              <button onClick={checkContractRegistration}>
                Click to Check
              </button>
            )}
            {showRegistrationStatus && (
              <p>{isContractRegistered ? "Yes! Woohoo" : "No :( wtf"}</p>
            )}
          </div>
          <div className="admin-item">
            <label>Set Winning Number:</label>
            <input
              type="number"
              value={winningNumber}
              onChange={(e) => setWinningNumber(e.target.value)}
            />
            <button onClick={setWinningNum}>Submit Winning Number</button>
          </div>
          <div className="admin-item">
            <label>Claim SFS Fees:</label>
            <input
              type="number"
              value={sfsFeeAmount}
              onChange={(e) => setSfsFeeAmount(e.target.value)}
            />
            <button onClick={claimSFSFees}>Send Fees to Contract</button>
          </div>
        </section>
      )}

      {/* Temporary!!! button to toggle winner status when devving
      <button onClick={toggleWinnerStatus}>Toggle Winner Status (Dev)</button> */}
      {isWinner && (
        <div className="winning-animation">
          <div className="winning-message">
            You Won!
            <p>yes, srsly....</p>
            <button onClick={claimReward} className="claim-button">
              get my money
            </button>
          </div>
        </div>
      )}
      {isWinner && showWinningAnimation && (
        <div className="winning-animation"></div>
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
          <CountdownTimer />
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
        </main>
      </div>

      <div className="rules-section">
        <div className="rules">
          <h3 className="rules-title">
            <span style={{ color: "#FF2E63", fontSize: "1.2em" }}>Rules:</span>{" "}
            closest to actual price after two weeks wins a share of the contract
            fees(SFS)! . The more people interact with this contract, the more
            Eth to be won!
          </h3>
          You can submit as many times as you like, *just costs gas.
        </div>
      </div>
    </div>
  );
}

export default App;
