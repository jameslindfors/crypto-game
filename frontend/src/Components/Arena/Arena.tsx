import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import {
  CONTACT_ADDRESS,
  transformFoodBowlData,
  transformPlayTimeData,
} from "../../constants";
import GAME from "../../utils/Game.json";
import { DogAttributes } from "../../utils/types";
import "./Arena.css";
import LoadingIndicator from "../LoadingIndicator";

const Arena = ({ characterNFT, setCharacterNFT }: any) => {
  const [gameContract, setGameContract] = useState<any>();
  const [foodBowl, setFoodBowl] = useState<any>();
  const [playTime, setPlayTime] = useState<any>();

  useEffect(() => {
    const { ethereum } = window as any;

    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const gameContract = new ethers.Contract(
        CONTACT_ADDRESS,
        GAME.abi,
        signer
      );
      setGameContract(gameContract);
    } else {
      console.log("No ethereum object found");
    }
  }, []);

  useEffect(() => {
    const fetchFoodBowl = async () => {
      const foodBowlTxn = await gameContract.getFoodBowl();
      setFoodBowl(transformFoodBowlData(foodBowlTxn));
    };
    const fetchPlayTime = async () => {
      const playTimeTxn = await gameContract.getPlayTime();
      setPlayTime(transformPlayTimeData(playTimeTxn));
    };

    const onFeedingComplete = (newFoodLevel: any, dogAttribs: any) => {
      const FoodLevel = newFoodLevel.toNumber();
      const PTreats = dogAttribs[0].toNumber();
      const PHunger = dogAttribs[1].toNumber();
      const PEnergy = dogAttribs[2].toNumber();

      console.log(
        `Feeding Complete: Food Level: ${FoodLevel} Player Hunger: ${PHunger} Player Energy: ${PEnergy} Player Treats: ${PTreats}`
      );

      setFoodBowl((prevState: any) => {
        return { ...prevState, food: FoodLevel };
      });

      setCharacterNFT((prevState: DogAttributes) => {
        return {
          ...prevState,
          hunger: PHunger,
          energy: PEnergy,
          treats: PTreats,
        };
      });
    };
    const onPlayTimeComplete = (newTreats: any, dogAttribs: any) => {
      const Treats = newTreats.toNumber();
      const newPHappy = dogAttribs[0].toNumber();
      const newPEnergy = dogAttribs[1].toNumber();
      const newPHunger = dogAttribs[2].toNumber();
      const newPTreats = dogAttribs[3].toNumber();

      console.log(
        `PlayTime Complete: TreatsLevel: ${Treats} Player Happiness: ${newPHappy} Player Energy: ${newPEnergy} Player Hunger: ${newPHunger} Player Treats: ${newPTreats}`
      );

      setPlayTime((prevState: any) => {
        return { ...prevState, treats: Treats };
      });

      setCharacterNFT((prevState: DogAttributes) => {
        return {
          ...prevState,
          happiness: newPHappy,
          energy: newPEnergy,
          hunger: newPHunger,
          treats: newPTreats,
        };
      });
    };

    if (gameContract) {
      fetchFoodBowl();
      fetchPlayTime();
      gameContract.on("FeedingComplete", onFeedingComplete);
      gameContract.on("PlayTimeComplete", onPlayTimeComplete);
    }
    return () => {
      if (gameContract) {
        gameContract.off("FeedingComplete", onFeedingComplete);
        gameContract.off("PlayTimeComplete", onPlayTimeComplete);
      }
    };
  }, [gameContract, setCharacterNFT]);

  // Actions
  const [eatingState, setEatingState] = useState<string>();
  const [playingState, setPlayingState] = useState<any>();

  const eatFood = async () => {
    try {
      if (gameContract) {
        setEatingState("running");
        console.log("Eating now...");
        const eatingTxn = await gameContract.eatFood();
        await eatingTxn.wait();
        console.log("Eatingtxn:", eatingTxn);
        setEatingState("complete");
      }
    } catch (error) {
      console.log("Error:", error);
      setEatingState("error");
    }
  };

  const play = async () => {
    try {
      setPlayingState("running");
      console.log("Playing now...");
      const playingTxn = await gameContract.playTime();
      await playingTxn.wait();
      console.log("Playingtxn:", playingTxn);
      setPlayingState("complete");
    } catch (error) {
      console.log("Error:", error);
      setPlayingState("error");
    }
  };

  return (
    <div className="arena-container">
      {foodBowl && playTime && (
        <span className="actions">
          <div className="boss-container">
            <div className={`boss-content ${eatingState}`}>
              <h2>🔥 {foodBowl.name} 🔥</h2>
              <div className="image-content">
                <img src={foodBowl.imageURI} alt={`Boss ${foodBowl.name}`} />
                <div className="health-bar">
                  <progress value={foodBowl.food} max={foodBowl.foodCapacity} />
                  <p>{`${foodBowl.food} / ${foodBowl.foodCapacity} Food`}</p>
                </div>
              </div>
            </div>
            <div className="attack-container">
              <button className="cta-button" onClick={eatFood}>
                {`💥 Use ${foodBowl.name}`}
              </button>
            </div>
          </div>
          {/* {-----------------} */}
          <div className="boss-container">
            <div className={`boss-content ${playingState}`}>
              <h2>🔥 {playTime.name} 🔥</h2>
              <div className="image-content">
                <img src={playTime.imageURI} alt={`Boss ${playTime.name}`} />
                <div className="health-bar">
                  <progress value={playTime.treats} max={playTime.maxTreats} />
                  <p>{`${playTime.treats} / ${playTime.maxTreats} Treats`}</p>
                </div>
              </div>
            </div>
            <div className="attack-container">
              <button className="cta-button" onClick={play}>
                {`💥 Use ${playTime.name}`}
              </button>
            </div>
          </div>
          {eatingState === "running" ||
            (playingState === "running" && (
              <div className="loading-indicator">
                <LoadingIndicator />
                <p>Loading ⚔️</p>
              </div>
            ))}
        </span>
      )}
      {characterNFT && (
        <div className="players-container">
          <div className="player-container">
            <h2>Your Pup</h2>
            <div className="player">
              <div className="image-content">
                <h2>{characterNFT.name}</h2>
                <img
                  src={characterNFT.imageURI}
                  alt={`Character ${characterNFT.name}`}
                />
                <div className="health-bar">
                  <progress
                    value={characterNFT.treats}
                    max={characterNFT.maxTreats}
                  />
                  <p>{`${characterNFT.treats} / ${characterNFT.maxTreats} Treats`}</p>
                </div>
              </div>
              <div className="stats">
                <h4>{`⚔️ Treats: ${characterNFT.treats}`}</h4>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Arena;
