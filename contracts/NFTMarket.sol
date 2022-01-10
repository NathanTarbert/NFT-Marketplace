// SPDX-License-Identifier: MIT OR Apache-2.0
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol"; //provides counters to incriment or decriment 
import "@openzeppelin/contracts/security/ReentrancyGuard.sol"; //prevents reent calls
import "@openzeppelin/contracts/token/ERC721/ERC721.sol"; //non-fungible token standard contract
import "hardhat/console.sol";


contract NFTMarket is ReentrancyGuard {
  using Counters for Counters.Counter;
  Counters.Counter private _itemIds; //this will count each token
  Counters.Counter private _itemsSold; //this will count each item sold

  address payable owner; //this is a commission to the owner
  uint256 listingPrice = 0.025 ether; //this is the listing price for each NFT listed. The owner of the contract will be paid this listing fee in MATIC

  constructor() {
    owner = payable(msg.sender);
  }

  struct MarketItem {
    uint itemId;
    address nftContract;
    uint256 tokenId;
    address payable seller;
    address payable owner;
    uint256 price;
    bool sold;
  }

  mapping(uint256 => MarketItem) private idToMarketItem;//this will map over the tokens minted so we can fetch all of our values associated

  event MarketItemStatus(
    uint256 indexed itemId,
    address indexed nftContract,
    uint256 indexed tokenId,
    address seller,
    address owner,
    uint256 price,
    bool sold
);

  modifier onlyOwner() {
    require(msg.sender == owner, "Only the owner can do this");
    _;
  }

  
  function getListingPrice() external view returns (uint256) { //Returns the listing price of the contract
    return listingPrice;
  }

  function getOwner() external view onlyOwner returns (address) { //this returns the owner of the contract
    return owner;
  }

  function getOwnerBalance() external view onlyOwner returns (uint256) { //this returns the owners balance
    return owner.balance;
  }
  
  
  function createMarketItem( //Places an item for sale on the marketplace
    address nftContract,
    uint256 tokenId,
    uint256 price
  ) public payable nonReentrant { //nonReentrant is a modifier that prevents a reentry attack
    require( price > 0, "Price must be at least 1 wei");
    require( msg.value == listingPrice, "Price must be equal to listing price");

    _itemIds.increment();
    uint256 itemId = _itemIds.current();
  
    idToMarketItem[itemId] = MarketItem(
      itemId,
      nftContract,
      tokenId,
      payable(msg.sender),
      payable(address(0)),
      price,
      false
    );

    IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId); //this will transfer the the ownership to the marketplace

    emit MarketItemStatus(
      itemId,
      nftContract,
      tokenId,
      msg.sender,
      address(0),
      price,
      false
  );
}

  // Creates the sale of a marketplace item, then
  // Transfers ownership of the item, pays both parties
    function createMarketSale(address nftContract, uint256 itemId)
        external
        payable
        nonReentrant
    {
        uint256 price = idToMarketItem[itemId].price;
        uint256 tokenId = idToMarketItem[itemId].tokenId;
        require( msg.value == price, "Please submit the asking price in order to complete the purchase" );

        idToMarketItem[itemId].seller.transfer(msg.value);
        IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId);
        idToMarketItem[itemId].owner = payable(msg.sender);
        idToMarketItem[itemId].sold = true;
        _itemsSold.increment();
        payable(owner).transfer(listingPrice);

        emit MarketItemStatus(
            itemId,
            nftContract,
            tokenId,
            idToMarketItem[itemId].seller,
            msg.sender,
            price,
            true
        );
    }
  
  function fetchMarketItems() external view returns (MarketItem[] memory) {
    uint itemCount = _itemIds.current();
    uint unsoldItemCount = _itemIds.current() - _itemsSold.current();
    uint currentIndex = 0;

    MarketItem[] memory items = new MarketItem[](unsoldItemCount);
    for (uint i = 0; i < itemCount; i++) {
      if (idToMarketItem[i + 1].owner == address(0)) {
        uint currentId = i + 1;
        MarketItem storage currentItem = idToMarketItem[currentId];
        items[currentIndex] = currentItem;
        currentIndex += 1;
      }
    }
    return items;
  }

   
   function fetchMyNFTs() external view returns (MarketItem[] memory) { // Returns only items that a user has purchased
    uint256 totalItemCount = _itemIds.current();
    uint256 itemCount = 0;
    uint256 currentIndex = 0;

    for (uint256 i = 0; i < totalItemCount; i++) {
        if (idToMarketItem[i + 1].owner == msg.sender) {
            itemCount += 1;
        }
    }

    MarketItem[] memory items = new MarketItem[](itemCount);
    for (uint256 i = 0; i < totalItemCount; i++) {
        if (idToMarketItem[i + 1].owner == msg.sender) {
            uint256 currentId = i + 1;
            MarketItem storage currentItem = idToMarketItem[currentId];
            items[currentIndex] = currentItem;
            currentIndex += 1;
        }
    }
    return items;
}

  
  function fetchItemsCreated() external view returns (MarketItem[] memory) { //Returns only items a user has created
    uint256 totalItemCount = _itemIds.current();
    uint256 itemCount = 0;
    uint256 currentIndex = 0;

    for (uint256 i = 0; i < totalItemCount; i++) {
        if (idToMarketItem[i + 1].seller == msg.sender) {
            itemCount += 1;
        }
    }

    MarketItem[] memory items = new MarketItem[](itemCount);
    for (uint256 i = 0; i < totalItemCount; i++) {
        if (idToMarketItem[i + 1].seller == msg.sender) {
            uint256 currentId = i + 1;
            MarketItem storage currentItem = idToMarketItem[currentId];
            items[currentIndex] = currentItem;
            currentIndex += 1;
        }
    }
    return items;
}
}