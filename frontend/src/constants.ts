const TWITTER_HANDLE = "_buildspace";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const CONTACT_ADDRESS: string = "0x80947d7efea753637A18378Fe9528e1C43249c89";

const transformCharacterData = (characterData: any) => {
  return {
    name: characterData.name,
    imageURI: characterData.imgURI,
    happiness: characterData.happiness.toNumber(),
    maxHappiness: characterData.maxHappiness.toNumber(),
    energy: characterData.energy.toNumber(),
    maxEnergy: characterData.maxEnergy.toNumber(),
    hunger: characterData.hunger.toNumber(),
    maxHunger: characterData.maxHunger.toNumber(),
    treats: characterData.treats.toNumber(),
    maxTreats: characterData.maxTreats.toNumber(),
  };
};

const transformFoodBowlData = (foodBowlData: any) => {
  return {
    name: foodBowlData.name,
    imageURI: foodBowlData.imgURI,
    hunger: foodBowlData.hunger.toNumber(),
    energy: foodBowlData.energy.toNumber(),
    treats: foodBowlData.treats.toNumber(),
    food: foodBowlData.food.toNumber(),
    foodCapacity: foodBowlData.foodCapacity.toNumber(),
  };
};

const transformPlayTimeData = (playTimeData: any) => {
  return {
    name: playTimeData.name,
    imageURI: playTimeData.imgURI,
    happiness: playTimeData.happiness.toNumber(),
    hunger: playTimeData.hunger.toNumber(),
    energy: playTimeData.energy.toNumber(),
    treatsEffect: playTimeData.treatsEffect.toNumber(),
    treats: playTimeData.treats.toNumber(),
    maxTreats: playTimeData.maxTreats.toNumber(),
  };
};

export {
  CONTACT_ADDRESS,
  TWITTER_HANDLE,
  TWITTER_LINK,
  transformCharacterData,
  transformFoodBowlData,
  transformPlayTimeData,
};
