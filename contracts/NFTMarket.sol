// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import "hardhat/console.sol";

contract NFTMarket is ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;//this will count each token
    Counters.Counter private _itemsSold;//this will count each item sold

    address payable owner;
    uint256 listingPrice = 0.025 ether;//this is the listing price for each NFT listed. The owner of the contract will be paid this listing fee

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

    mapping(uint256 => MarketItem)private idToMarkItem;//this will map over the tokens minted so we can fetch all of our values associated

    event MarketItemCreated (
        uint indexed itemId,
        address indexed tokenId,
        uint256 indexed tokenId,
        address seller,
        address owner,
        uint256 price,
        bool sold
    );

    function getListingPrice() public view returns (uint256) {
        return listingPrice;
    }

    function createMarketItem(
        address nftContract,
        uint256 tokenId,
        uint256 price
    ) public payable nonReentrant { //nonReentrant is a modifier that prevents a reentry attack
        require(price > 0, 'Price must be at least 1 wei');
        require(msg.value == listingPrice, 'Price must be equal to the listing price');

        _itemIds.increment();
        _uint256 itemId = _itemIds.current();

        idToMarketItem[itemId] = MarketItem(
            itemId,
            nftContract,
            tokenId,
            payable(msg.sender),
            payable(address(0)),
            price,
            false
        );

        IERC721(nftContract).transerFrom(msg.sender, address(this), tokenId);

        emit MarketItemCreated(
            itemId,
            nftContract,
            tokenId,
            msg.sender,
            address(0),
            price,
            false
        )
    }

    function createMarketSale(
        address nftContract,
        uint256 itemId
    )   public payable nonReentrant {
    uint price = idToMarkItem[itemId].price;
    uint tokenId = idToMarkItem[itemId].tokenId;
    require(msg.value == price, 'Please submit the asking price in order to complete the purchase');

    idToMarkItem[itemId].seller.transfer(msg.value);
    IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId);//this will transfer the ownership from the contract address(owner)
    idToMarkItem[itemId].owner = payable(msg.sender);
    _itemsSold.increment();//update the number by 1
    payable(owner).transfer(listingPrice);//pay the owner of the contract / commision
    }

    function fetchMarketItems() public view returns (MarketItem[] memory) { //returns an array of market items to view on the client side
        uint itemCount = _itemIds.current();
        uint unsoldItemCount = _itemIds.current() - _itemsSold.current();
        uint currentIndex = 0;

        MarketItem[] memory items = new MarketItem[](unsoldItemCount); //create a new array to loop over
        for (uint i = 0; i < itemCount; i++) {
            if (idToMarketItem[i + 1].owner == address(0)) {
                uint currentId = idToMarketItem[i + 1].itemId;
                MarketItem storage currentItem = idToMarketItem(currentId);
                    items[currentIndex] = currentItem;
                    currentIndex += 1;
            }
        }
        return items;
    }

    function fetchMyNFTs() public view returns (MarketItem[] memory) { //fetch the nfts that have been created by the contract owner
        uint totalItemCount = _itemIds.current();
        uint itemCount = 0;
        uint currentIndex = 0;

        for (uint i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].owner == msg.sender) {
                itemCount += 1;
            }
        }

        MarketItem[] memory items = new MarketItem[](itemCount);
            for (uint i = 0; i < totalItemCount; i++) {
                if (idToMarketItem[i + 1].owner == msg.sender) {
                    uint currentId = idToMarketItem[i + 1].itemSold;
                    MarketItem storage currentItem = idToMarketItem[currentId];
                    items[currentIndex] = currentItem;
                    currentIndex += 1;
                }
            }
            return items;
    }

    function fetchItemsCreated() public view returns (MarketItems[] memory) {//fetching the items created by the seller
        uint totalItemCount = _itemIds.current();
        uint itemCount = 0;
        uint currentIndex = 0;

        for (uint i = 0; i < totalItemCount; i++) {//loop over items and return the item count
            if (idToMarketItem[i + 1].seller == msg.sender) {//if found we update the value by incrementing by 1
                itemCount += 1;
            }
        }

        MarketItem[] memory items = new MarketItem[](itemCount);
         for (uint i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].seller == msg.sender) {//check to see if the seller address is equal the msg.sender
                uint currentId = idToMarketItem[i + 1].itemSold;
                MarketItem storage currentItem = idToMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
    return items;
    }
}