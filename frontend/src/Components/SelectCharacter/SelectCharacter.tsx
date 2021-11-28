import React, { useEffect, useState } from "react";
import "./SelectCharacter.css";
import { ethers } from "ethers";
import { DogAttributes } from "../../utils/types";
import { CONTACT_ADDRESS, transformCharacterData } from "../../constants";
import GAME from "../../utils/Game.json";
import LoadingIndicator from "../LoadingIndicator/index";

const SelectCharacter = ({ setCharacterNFT }: any) => {
  const [characters, setCharacters] = useState<DogAttributes[]>([]);
  const [gameContract, setGameContract] = useState<ethers.Contract | null>();
  const [mintingCharacter, setMintingCharacter] = useState<boolean>(false);

  useEffect(() => {
    const { ethereum } = window as any;

    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTACT_ADDRESS, GAME.abi, signer);

      setGameContract(contract);
    } else {
      console.log("Ethereum Object not Found");
    }
  }, []);

  useEffect(() => {
    const getCharacters = async () => {
      try {
        // console.log("Getting available characters to mint");
        const characterTxn = await gameContract?.getAllDefaultDogs();
        // await characterTxn?.wait();
        // console.log("Characters TXN", characterTxn);

        const characters = characterTxn.map((data: any) => {
          return transformCharacterData(data);
        });

        setCharacters(characters);
      } catch (error) {
        console.log("Error getting characters", error);
      }
    };

    const onDogNFTMinted = async (
      sender: string,
      tokenId: number,
      characterIndex: number
    ) => {
      console.log(
        `CharacterNFTMinted - sender: ${sender} tokenId: ${tokenId} characterIndex: ${characterIndex}`
      );

      if (gameContract) {
        const characterNFT = await gameContract.checkIfUserHasNFT();
        await characterNFT.wait();
        console.log("CharacterNFT: ", characterNFT);
        setCharacterNFT(transformCharacterData(characterNFT));
      }
    };

    if (gameContract) {
      getCharacters();

      gameContract.on("DogNFTMinted", onDogNFTMinted);
    }

    return () => {
      /*
       * When your component unmounts, lets make sure to clean up this listener
       */
      if (gameContract) {
        gameContract.off("DogNFTMinted", onDogNFTMinted);
      }
    };
  }, [gameContract, setCharacterNFT]);

  const renderCharacters = () =>
    characters.map((character: DogAttributes, index: number) => (
      <div className="character-item" key={character.name}>
        <div className="name-container">
          <p>{character.name}</p>
        </div>
        <img src={character.imageURI} alt={character.name} />
        <button
          type="button"
          className="character-mint-button"
          onClick={mintCharacterNFTAction(index)}
        >{`Mint ${character.name}`}</button>
      </div>
    ));

  const mintCharacterNFTAction = (characterId: number) => async () => {
    try {
      if (gameContract) {
        setMintingCharacter(true);
        console.log("Minting Character NFT");
        const mintTxn = await gameContract.mintCharacterNFT(characterId);
        await mintTxn.wait();
        console.log("Minted TXN", mintTxn);
        setMintingCharacter(false);
      }
    } catch (error) {
      console.log("Error minting character", error);
      setMintingCharacter(false);
    }
  };

  return (
    <div className="select-character-container">
      <h2>Mint your Dog</h2>
      {characters.length > 0 && (
        <div className="character-grid">{renderCharacters()}</div>
      )}
      {mintingCharacter && (
        <div className="loading">
          <div className="indicator">
            <LoadingIndicator />
            <p>Minting In Progress...</p>
          </div>
          {/* <img
            src="https://media2.giphy.com/media/61tYloUgq1eOk/giphy.gif?cid=ecf05e47dg95zbpabxhmhaksvoy8h526f96k4em0ndvx078s&rid=giphy.gif&ct=g"
            alt="Minting loading indicator"
          /> */}
        </div>
      )}
    </div>
  );
};

export default SelectCharacter;
