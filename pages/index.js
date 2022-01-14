/* pages/index.js */
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import axios from 'axios';//data fetching library
import Web3Modal from "web3modal";//allows us to connect to a Metamask wallet
import { nftaddress, nftmarketaddress } from "../config";
import NFT from "../artifacts/contracts/NFT.sol/NFT.json";
import Market from "../artifacts/contracts/NFTMarket.sol/NFTMarket.json";

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Home() {
  const [nfts, setnfts] = useState([]);
  const [loadingState, setLoadingState] = useState(false);
  useEffect(() => {
    loadNFTs();
  },[]);

  async function loadNFTs() {
    const provider = new ethers.providers.JsonRpcProvider(`https://kovan.infura.io/v3/`);// will need one of the RPC's from the Mumbai Testnet site "https://matic-mumbai.chainstacklabs.com"
    const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider);
    const marketContract = new ethers.Contract(nftmarketaddress, Market.abi, provider);
    const data = await marketContract.fetchMarketItems();//this is referencing the function in our Market contract
     
      
    // map over items returned from smart contract and format them as well as fetch their token metadata    
    const items = await Promise.all(
      data.map(async (i) => { 
      const tokenUri = await tokenContract.tokenURI(i.tokenId);
      const meta = await axios.get(tokenUri); // this will be the token id
      let price = ethers.utils.formatUnits(i.price.toString(), "ether");//this will format the price and remove the 18 zeros
      let item = {
      price,
      tokenId: i.tokenId.toNumber(),
      seller: i.seller,
      owner: i.owner,
      image: meta.data.image,
      name: meta.data.name,
      description: meta.data.description,
      tokenDetails: tokenUri,
      };
      return item;
    }));
    setnfts(items);
    setLoadingState(true);
    
    // console.log('item', items);
  }

  async function buyNft(nft) {
    const web3Modal = new Web3Modal();//calls the wallet
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);

    console.log(provider)
    const signer = provider.getSigner();
    const contract = new ethers.Contract(nftmarketaddress, Market.abi, signer);

    let price = ethers.utils.parseUnits(nft.price.toString(), "ether");

    const transaction = await contract.createMarketSale(
      nftaddress, 
      nft.tokenId, {
      value: price
    });
    await transaction.wait();
    loadNFTs();
  }

  if (loadingState === true && !nfts.length) return (
    <h1 className="px-20 py-10 text-3xl">No items in marketplace</h1>
  )  

  return (

  <>
  <Head>
    <title>NFT Marketplace</title>
  </Head>
    <div className="flex justify-center">
      <div className="px-4" style={{maxWidth: '1600px' }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
         
            { nfts.map((nft, index) => (
              <div key={index} className="border shadow rounded-xl overflow-hidden">
                  <Image
                        src={nft.image}
                        alt="NFT"
                        width="300"
                        height="300"
                        objectFit="contain"
                  />
                <div className="p-4">
                  <p style={{ height: '34px'}} className="text-2xl font-semibold">{nft.name}</p>
                  <div style={{ height: '30px', overflow: 'hidden'}}>
                    <p className="text-gray-400">{nft.description}</p>
                  </div>
                </div>
                <div className="p-4 bg-black">
                  <p className="text-2xl mb-4 font-bold text-white">{nft.price} ETH</p>
                  <button className="w-full bg-gradient-to-r from-blue-500 to-cyan-200 text-white font-bold py-2 px-12 rounded" 
                  onClick={() => buyNft(nft)}>Buy</button>
                </div>

                <Link href={nft.tokenDetails}>
                  <a target="_blank">
                    <button className="mt-2  cursor-pointer w-full bg-gradient-to-r from-blue-500 to-cyan-200 text-white font-bold py-2 px-12 rounded">
                      Details
                    </button>
                  </a>
                </Link>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  </>
  )
}
