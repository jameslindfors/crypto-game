// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.4;

//NFT contract to inherit from
import '@openzeppelin/contracts/token/ERC721/ERC721.sol';

// Helper functions OpenZepplin provides
import '@openzeppelin/contracts/utils/Counters.sol';
import '@openzeppelin/contracts/utils/Strings.sol';

// encode helper lib
import './libs/Base64.sol';


import 'hardhat/console.sol';

// Contract inherits from ERC721 - Standard for NFTs
contract Game is ERC721 {
    struct DogAttributes{
        uint id;
        string name;
        string imgURI;
        uint happiness;
        uint maxHappiness;
        uint energy;
        uint maxEnergy;
        uint hunger;
        uint maxHunger;
        uint treats;
        uint maxTreats;
    }
    struct FoodBowlAttributes{
        string name;
        string imgURI;
        uint hunger;
        uint energy;
        uint treats;
        uint food;
        uint foodCapacity;
    }
    struct PlayTimeAttributes{
        string name;
        string imgURI;
        uint happiness;
        uint hunger;
        uint energy;
        uint treatsEffect;
        uint treats;
        uint maxTreats;
    }
    FoodBowlAttributes public FoodBowl;
    PlayTimeAttributes public PlayTime;

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;


    DogAttributes[] defaultCharacters;

    // Mapping from token id => Character
    mapping (uint256 => DogAttributes) public nftHolderAttributes; 
    // Mapping from an address =? the NFTs tokenID.
    // Easy way to store the owner of the NFT and fetch it later
    mapping(address => uint256) public nftHolders;

    event DogNFTMinted(address sender, uint256 tokenId, uint256 characterIndex);
    event FeedingComplete(uint food, uint256[3] dogAttribs);
    event PlayTimeComplete(uint treats, uint[4] dogAttribs);


    constructor (
        string[] memory dogNames,
        string[] memory dogImgURIs,
        uint[] memory dogHappiness,
        uint[] memory dogEnergy,
        uint[] memory dogHunger,
        uint[] memory dogTreats,
        
        string[] memory activityURIs,
        uint[] memory activityHappiness,
        uint[] memory activityEnergy,
        uint[] memory activityHunger,
        uint[] memory activityTreats
    ) 
        ERC721(
            "Pearl",
            "PERL"
        )
    {
        // // Initalize interaction attributes
        FoodBowl = FoodBowlAttributes({
                name: "Food Bowl",
                imgURI: activityURIs[0],
                hunger: activityHunger[0],
                energy: activityEnergy[0],
                treats: activityTreats[0],
                food: 500,
                foodCapacity: 500
            });
        console.log("Initialized FoodBowl attributes");
        PlayTime = PlayTimeAttributes({
                name: "Play Time",
                imgURI: activityURIs[1],
                happiness: activityHappiness[1],
                energy: activityEnergy[1],
                hunger: activityHunger[1],
                treatsEffect: activityTreats[1],
                treats: 300,
                maxTreats: 300
            });
        console.log("Initialized PlayTime attributes");

        // Initalize default characters
        for (uint i = 0; i < dogNames.length; i++) {
            defaultCharacters.push(DogAttributes({
                id: i,
                name: dogNames[i],
                imgURI: dogImgURIs[i],
                happiness: dogHappiness[i],
                maxHappiness: dogHappiness[i],
                energy: dogEnergy[i],
                maxEnergy: dogEnergy[i],
                hunger: dogHunger[i],
                maxHunger: dogHunger[i],
                treats: dogTreats[i],
                maxTreats: dogTreats[i]
            }));
        }
            _tokenIds.increment();
    }

    // Mint a new NFT
    function mintCharacterNFT(uint _characterIndex) external {
        // Get current tokenId (starts at 1)
        uint256 newItemId = _tokenIds.current();

        // Assign tokenId to caller wallet address
        _safeMint(msg.sender, newItemId);

        // Map tokenId to character attributes
        nftHolderAttributes[newItemId] = DogAttributes({
            id : _characterIndex,
            name: defaultCharacters[_characterIndex].name,
            imgURI: defaultCharacters[_characterIndex].imgURI,
            happiness: defaultCharacters[_characterIndex].happiness,
            maxHappiness: defaultCharacters[_characterIndex].maxHappiness,
            energy: defaultCharacters[_characterIndex].energy,
            maxEnergy: defaultCharacters[_characterIndex].maxEnergy,
            hunger: defaultCharacters[_characterIndex].hunger,
            maxHunger: defaultCharacters[_characterIndex].maxHunger,
            treats: defaultCharacters[_characterIndex].treats,
            maxTreats: defaultCharacters[_characterIndex].maxTreats
        });

        console.log("Minted NFT with tokenID and characterIndex: ", newItemId, _characterIndex);

        nftHolders[msg.sender] = newItemId;
        _tokenIds.increment();

        emit DogNFTMinted(msg.sender, newItemId, _characterIndex);
    }

    // Convert metadata to base64
    function tokenURI(uint256 _tokenId) public view override returns (string memory) {
        DogAttributes memory charAttributes = nftHolderAttributes[_tokenId];

        string memory happiness = Strings.toString(charAttributes.happiness);
        string memory maxHappiness = Strings.toString(charAttributes.maxHappiness);
        string memory energy = Strings.toString(charAttributes.energy);
        string memory maxEnergy = Strings.toString(charAttributes.maxEnergy);
        string memory hunger = Strings.toString(charAttributes.hunger);
        string memory maxHunger = Strings.toString(charAttributes.maxHunger);
        string memory treats = Strings.toString(charAttributes.treats);
        string memory maxTreats = Strings.toString(charAttributes.maxTreats);


        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{"name": "', charAttributes.name,' -- NFT #: ',Strings.toString(_tokenId),'", "description": "Pearl NFT for game!", "image": "',charAttributes.imgURI,'", "attributes": [ { "trait_type": "Happiness", "value": ',happiness,', "max_value":',maxHappiness,'}, { "trait_type": "Energy", "value": ', energy,', "max_value":',maxEnergy,'},{ "trait_type": "Hunger", "value": ', hunger,', "max_value":',maxHunger,'},{ "trait_type": "Treats", "value": ', treats,', "max_value":',maxTreats,'} ]}'
                    )
                )
            )
        );

        string memory output = string(
            abi.encodePacked("data:application/json;base64,", json)
        );
        return output;
    }

    // Activity functions
    function eatFood() public {
        uint256 nftTokenIdOfPlayer = nftHolders[msg.sender];
        DogAttributes storage player = nftHolderAttributes[nftTokenIdOfPlayer];

        require(player.treats > FoodBowl.treats, "Error: character must have enough treats to get food.");

        require(FoodBowl.foodCapacity > 0, "Error: Bowl must have enough food to feed");

        // if(FoodBowl.foodCapacity < player.attackDamage) {
        //     boss.hp = 0;
        // } else {
        //     boss.hp -= player.attackDamage;
        // }

        if(player.treats < FoodBowl.treats) {
            player.treats = 0;

            FoodBowl.food -= FoodBowl.treats;

        } else {
            player.treats -= FoodBowl.treats;
            player.hunger += FoodBowl.hunger;
            player.energy += FoodBowl.energy;

            FoodBowl.food -= FoodBowl.treats;
            
        }   
            emit FeedingComplete(FoodBowl.food, [player.treats, player.hunger, player.energy]);
            console.log("Player ate food and now has: ", player.treats, player.hunger, player.energy);

    }

    function playTime() public {
        uint256 nftTokenIdOfPlayer = nftHolders[msg.sender];
        DogAttributes storage player = nftHolderAttributes[nftTokenIdOfPlayer];

        require(player.energy > PlayTime.energy, "Error: character must have enough energy to play.");
        require(player.hunger > PlayTime.hunger, "Error: character must have enough hunger to play.");

        if(player.energy < PlayTime.energy || player.hunger < PlayTime.hunger) {
            if(player.energy < PlayTime.energy)
            player.energy = 0;
            if(player.hunger < PlayTime.hunger) 
            player.hunger = 0;

            PlayTime.treats -= PlayTime.treatsEffect;
        } else {
            player.energy -= PlayTime.energy;
            player.hunger -= PlayTime.hunger;
            player.happiness += PlayTime.happiness;
            player.treats += PlayTime.treatsEffect;

            PlayTime.treats -= PlayTime.treatsEffect;

            console.log("Played and now has: ", player.treats, player.hunger, player.energy);
        }
        emit PlayTimeComplete(PlayTime.treats, [player.happiness, player.energy, player.hunger, player.treats]);
    }

    // Utils
    function checkIfUserHasNFT() public view returns (DogAttributes memory) {
        uint256 nftTokenIdOfPlayer = nftHolders[msg.sender];
        
        if(nftTokenIdOfPlayer > 0) {
            return nftHolderAttributes[nftTokenIdOfPlayer];
        } else{
            DogAttributes memory emptyStruct;
            return emptyStruct;
        }
    }

    function getAllDefaultDogs() public view returns (DogAttributes[] memory) {
        return defaultCharacters;
    }
    function getFoodBowl() public view returns (FoodBowlAttributes memory) {
        return FoodBowl;
    }
    function getPlayTime() public view returns (PlayTimeAttributes memory) {
        return PlayTime;
    }
}