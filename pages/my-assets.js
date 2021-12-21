import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { create as ipfsHttpClient } from 'ipfs-http-client';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Head from 'next/head';
import Web3Modal from 'web3modal';

import { nftaddress, nftmarketaddress } from '../config';

import NFT from '../artifacts/contracts/NFT.sol/NFT.json';
import Market from '../artifacts/contracts/Market.sol/NFTMarket.json';

const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0');

export default function MyAssets() {
    const [nfts, setNfts] = useState([]);
    const [loadingState, setLoadingState] = useState(false);

  useEffect(() => {
    loadNFTs();
  },[]);

  async function loadNFTs() {
    const web3Modal = new Web3Modal({
      network: "testnet",
      cacheProvider: true,
    });

    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
      
    const marketContract = new ethers.Contract(nftmarketaddress, Market.abi, signer);
    const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider);
    const data = await marketContract.fetchMyNFTs();
    
    const items = await Promise.all(data.map(async i => {
      const tokenUri = await tokenContract.tokenURI(i.tokenId);
      const meta = await axios.get(tokenUri);
      let price = ethers.utils.formatUnits(i.price.toString(), 'ether');
      let item = {
        price,
        tokenId: i.tokenId.toNumber(),
        seller: i.seller,
        owner: i.owner,
        image: meta.data.image,
      };
      return item;
    }));
    setNfts(items);
    setLoadingState(true);
  }
    if (loadingState === true && !nfts.length) return (<h1 className="py-10 px-20 text-3xl">No assets owned</h1>)
  return (
    
    <>
      <Head>
        <title>MY NFTs</title>
      </Head>
    <div className="flex justify-center">
      <div className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {
            nfts.map((nft, i) => (
              <div key={i} className="border shadow rounded-xl overflow-hidden">
                <Image src={nft.image} className="rounded" alt='My-NFT' />
                <div className="p-4 bg-black">
                  <p className="text-2xl font-bold text-white">Price - {nft.price} Eth</p>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
    </>
  )
}
