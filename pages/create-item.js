import { useState } from 'react';
import { ethers } from 'ethers';
import { create as ipfsHttpClient } from 'ipfs-http-client';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Head from 'next/head';
import Web3Modal from 'web3modal';

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { nftaddress, nftmarketaddress } from '../config';

import NFT from '../artifacts/contracts/NFT.sol/NFT.json';
import Market from '../artifacts/contracts/NFTMarket.sol/NFTMarket.json';

export default function CreateItem() {
  const [fileUrl, setFileUrl] = useState(null);
  const [formInput, updateFormInput] = useState({ price: '', name: '', description: '' });
  const router = useRouter();

  const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0');

  const notify = (id, msg) =>
    toast(msg, {
      toastId: id,
      autoClose: false,
      type: toast.TYPE.INFO,
      closeButton: false,
      theme: "colored",
    });


  async function onChange(e) {
    const file = e.target.files[0];
    try {
      const added = await client.add(
        file,
        {
          progress: (prog) => console.log(`received: ${prog}`)
        }
      );
      const url = `https://ipfs.infura.io/ipfs/${added.path}`;
      setFileUrl(url);
    } catch (error) {
      console.log('Error uploading file: ', error);
      toast.error("Error uploading file: ", {
        theme: "colored",
      });      
    }  
  }
  async function createMarket() {
    const { name, description, price } = formInput;
  //   if ( !name || !description || !price ) {
  //     toast.error("Please fill in all feilds:", {
  //       theme: "colored",
  //     });
  //     return;    }

    
  //   if (!is_Int(price)) {
  //     toast.error("Price must be a number", {
  //       theme: "colored",
  //     });
  //     return;
  //   }

  //   if (!fileUrl) {
  //     toast.error("Please select a file", {
  //       theme: "colored",
  //     });
  //     return;
  //   }

    /* first, upload to IPFS */
    const data = JSON.stringify({
      name, description, image: fileUrl
    });
    try {
      const added = await client.add(data);
      const url = `https://ipfs.infura.io/ipfs/${added.path}`;
      /* after file is uploaded to IPFS, pass the URL to save it on Polygon */
      createSale(url);
    } catch (error) {
      console.log('Error uploading file: ', error);
    }  
  }

  async function createSale(url) {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);  
    const signer = provider.getSigner();
    
    /* next, create the item */
    let contract = new ethers.Contract(nftaddress, NFT.abi, signer);
    let transaction = await contract.createToken(url);
    let tx = await transaction.wait();
    let event = tx.events[0];
    let value = event.args[2];
    let tokenId = value.toNumber();

    const price = ethers.utils.parseUnits(formInput.price, 'ether');
  
    /* then list the item for sale on the marketplace */
    contract = new ethers.Contract(nftmarketaddress, Market.abi, signer);
    let listingPrice = await contract.getListingPrice();
    listingPrice = listingPrice.toString();

    transaction = await contract.createMarketItem(nftaddress, tokenId, price,
      { 
         value: listingPrice 
      }
    );
    await transaction.wait();
    router.push('/');
  }

  return (

     <>
      <Head>
        <title>NFT Marketplace | Create</title>
      </Head>

    <div className="flex justify-center">
      <div className="w-1/2 flex flex-col pb-12">
        <input 
          placeholder="Asset Name"
          className="mt-8 border rounded p-4"
          onChange={e => updateFormInput({ ...formInput, name: e.target.value })}
        />
        <textarea
          placeholder="Asset Description"
          className="mt-2 border rounded p-4"
          onChange={e => updateFormInput({ ...formInput, description: e.target.value })}
        />
        <input
          placeholder="Asset Price in MATIC"
          className="mt-2 border rounded p-4"
          onChange={e => updateFormInput({ ...formInput, price: e.target.value })}
        />
        <input
          placeholder='Asses Description'
          type="file"
          name="Asset"
          className="my-4"
          onChange={onChange}
        />
        {
          fileUrl && (
            <div>
                <Image className="rounded mt-4" width="250" height='250' alt='NFT' objectFit='contain' src={fileUrl} />
            </div>            
          )
        }
        <button onClick={createMarket} className="font-bold mt-4 bg-gradient-to-r from-blue-500 to-cyan-200 text-white rounded p-4 shadow-lg">
          Create Digital Asset
        </button>
      </div>
    </div>
    </>
  )
}
