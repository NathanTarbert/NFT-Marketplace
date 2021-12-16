// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import "hardhat/console.sol";

contract NFT is ERC721URIStorage {
    using Counters for Counters.Counter;//importing Counters so we can track each NFT and that value starts at 0
    Counters.Counter private _tokenIds;
    address contractAddress;

    constructor(address marketPlaceAddress) ERC721('Metaverse Tokens', 'METT') {
        contractAddress = marketPlaceAddress;
    }

    function createToken(string memory tokenURI) public returns (uint) {
        _tokenIds.increment();//this will incriment the value starting at 0
        uint256 newItemId = _tokenIds.current();

        _mint(msg.sender, newItemId);//this will add a token id to each NFT that is minted
        _setTokenURI(newItemId, tokenURI);
        setAppovalForAll(contractAddress, true);
        return newItemId;
    }
}
