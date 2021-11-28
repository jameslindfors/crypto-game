const main = async () => {
  const gameContractFactory = await hre.ethers.getContractFactory("Game");
  const gameContract = await gameContractFactory.deploy(
    ["Sleepy", "Happy", "Funny"], // Names
    [
      "https://i.ibb.co/Bnb4RSn/sleepy-Pearl.png",
      "https://i.ibb.co/LhCsFtS/happy-Pearl.png",
      "https://i.ibb.co/sRpj80w/funny-Pearl.png",
    ], // Images
    [70, 100, 80], // dog happiness
    [45, 55, 75], // dog energy
    [80, 55, 65], // dog hunger
    [100, 100, 100], // dog treats
    [
      "https://static.vecteezy.com/system/resources/previews/004/261/123/non_2x/dog-food-bowl-isolated-icon-free-free-vector.jpg",
      "https://www.misskatecuttables.com/uploads/shopping_cart/9969/large_dog-toy-set.png",
    ], // activity images
    [0, 15], // activity happiness effect
    [25, 35], // activity energy effect
    [60, 50], // activity hunger effect
    [25, 15] // activity treat effect
  );
  console.log("Deploying game contract...");
  await gameContract.deployed();
  console.log(`Contract deployed to: ${gameContract.address}`);
};

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};

// 0x6b58449455D8D26cE6c82785A9F76CE6879e17A4

runMain();
