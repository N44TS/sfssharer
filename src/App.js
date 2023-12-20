import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import abi from "./utils/abi.json";

const contractAddress = "0x51B4a52967Aa3dc93409b636016c0BC6bD2E59A8";

function App() {
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [prediction, setPrediction] = useState("");
  const [winningNumber, setWinningNumber] = useState("");
  const [sfsFeeAmount, setSfsFeeAmount] = useState("");

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
  }, []);

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
    <div>
      <h1>Prediction Contract Interface</h1>
      {account && <p>Connected Account: {account}</p>}

      <div>
        <input
          type="number"
          value={prediction}
          onChange={(e) => setPrediction(e.target.value)}
          placeholder="Your Prediction"
        />
        <button onClick={submitPrediction}>Submit Prediction</button>
      </div>

      <div>
        <button onClick={claimReward}>Claim Reward</button>
      </div>

      {isAdmin && (
        <>
          <div>
            <input
              type="number"
              value={winningNumber}
              onChange={(e) => setWinningNumber(e.target.value)}
              placeholder="Winning Number"
            />
            <button onClick={setWinningNum}>Set Winning Number</button>
          </div>

          <div>
            <input
              type="number"
              value={sfsFeeAmount}
              onChange={(e) => setSfsFeeAmount(e.target.value)}
              placeholder="SFS Fee Amount"
            />
            <button onClick={claimSFSFees}>Claim SFS Fees</button>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
