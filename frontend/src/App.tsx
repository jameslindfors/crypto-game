import React, { useEffect, useState } from "react";
import "./App.css";
import { ethers } from "ethers";
import GAME from "./utils/Game.json";

// Components
import SelectCharacter from "./Components/SelectCharacter/SelectCharacter";
import Arena from "./Components/Arena/Arena";
import LoadingIndicator from "./Components/LoadingIndicator/index";

// Constants
import {
  CONTACT_ADDRESS,
  // TWITTER_HANDLE,
  // TWITTER_LINK,
  transformCharacterData,
} from "./constants";
import { DogAttributes } from "./utils/types";
// const twitterLogo = require("./assets/twitter-logo.svg") as string;

const App = () => {
  const [currentAccount, setCurrentAccount] = useState<string | null>(null);
  const [characterNFT, setCharacterNFT] = useState<DogAttributes | null>(null);
  const [loading, setLoading] = useState(false);

  // ACTIONS
  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window as any;

      if (!ethereum) {
        // console.log("Make sure you have metamask installed");
        setLoading(false);
        return;
      } else {
        // console.log("Connected to metamask", ethereum);
        const accounts = await ethereum.request({ method: "eth_accounts" });

        if (accounts.length !== 0) {
          const account = accounts[0];
          // console.log("Found Authorized Account", account);
          setCurrentAccount(account);
        } else {
          // console.log("No Authorized Account Found");
        }
      }
      setLoading(false);
    } catch (error) {
      console.log("Error", error);
    }
  };

  const connectWallet = async () => {
    try {
      const { ethereum } = window as any;
      if (!ethereum) {
        // console.log("Make sure you have metamask installed");
        return;
      }
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      // console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log("Error", error);
    }
  };

  const renderContent = () => {
    if (loading) {
      return <LoadingIndicator />;
    }
    if (!currentAccount) {
      return (
        <div className="connect-wallet-container">
          <img
            src="https://c.tenor.com/34hnCG81c40AAAAM/super-dog-wtf.gif"
            alt="Flying Dog Gif"
          />
          <button
            className="cta-button connect-wallet-button"
            onClick={connectWallet}
          >
            Connect Wallet to get Started
          </button>
        </div>
      );
    } else if (currentAccount && !characterNFT) {
      return <SelectCharacter setCharacterNFT={setCharacterNFT} />;
    } else if (currentAccount && characterNFT) {
      return (
        <Arena characterNFT={characterNFT} setCharacterNFT={setCharacterNFT} />
      );
    }
  };

  useEffect(() => {
    setLoading(true);
    checkIfWalletIsConnected();
  }, []);
  useEffect(() => {
    const fetchMetadata = async () => {
      // console.log("Checking for character nft on address: ", currentAccount);

      const provider = new ethers.providers.Web3Provider(
        (window as any).ethereum
      );
      const signer = provider.getSigner();
      const gameContract = new ethers.Contract(
        CONTACT_ADDRESS,
        GAME.abi,
        signer
      );
      const txn = await gameContract.checkIfUserHasNFT();
      // console.log(txn);
      if (txn.name) {
        // console.log("User has NFT");
        setCharacterNFT(transformCharacterData(txn));
      } else {
        // console.log("User does not have NFT");
      }
      setLoading(false);
    };
    if (currentAccount) {
      fetchMetadata();
    }
  }, [currentAccount]);

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">Dog NFT</p>
          <p className="sub-text">
            Take care of your dog and earn as many treats as possible!
          </p>
          {renderContent()}
        </div>
      </div>
      {/* <div className="footer-container">
        <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
        <a
          className="footer-text"
          href={TWITTER_LINK}
          target="_blank"
          rel="noreferrer"
        >{`built with @${TWITTER_HANDLE}`}</a>
      </div> */}
    </div>
  );
};

export default App;
