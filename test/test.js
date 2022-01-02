const { expect } = require("chai");
const { ethers } = require("hardhat");//to run the test in the terminal it's: npx hardhat test

describe("NFTMarket", function () {
  it("Should create and execute market sales", async function () {
    const Market = await ethers.getContractFactory('NFTMarket');
    const market = await Market.deploy();
    await market.deployed();
    const marketAddress = market.address;

    const NFT = await ethers.getContractFactory('NFT');
    const nft = await NFT.deploy(marketAddress);
    await nft.deployed();
    const nftContractAddress = nft.address;

    let listingPrice = await market.getListingPrice();
    listingPrice = listingPrice.toString();

    const auctionPrice = ethers.utils.parseUnits('100', 'ether');

    await nft.createToken('https://mytokenlocation.com');
    await nft.createToken('https://mytokenlocation2.com');

    await market.createMarketItem(nftContractAddress, 1, auctionPrice, { value: listingPrice });
    await market.createMarketItem(nftContractAddress, 2, auctionPrice, { value: listingPrice });

    const [_, buyerAddress] = await ethers.getSigners(); //test account provided by ethers docs

    await market.connect(buyerAddress).createMarketSale(nftContractAddress, 1, { value: auctionPrice});

    items = await market.fetchMarketItems();
    items = await Promise.all(items.map(async i => {//map over the items returned
      const tokenUri = await nft.tokenURI(i.tokenId);//get the value of the tokenUri
      let item = { //we only want to return these values in the test
        price: i.price.toString(),
        tokenId: i.tokenId.toString(),
        seller: i.seller,
        owner: i.owner,
        tokenUri
      };
      return item;
    }));

    console.log('items: ', items);



  });
});
