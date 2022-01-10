import Link from 'next/link';

function Nav() {
  return (
    <>
      <nav className="border-b shadow-md p-6 bg-gradient-to-r from-blue-500 to-cyan-200" style={{ fontFamily: 'Acme, sans-serif' }}>      
        <p className="text-4xl text-red-100 font-bold" >MLA - NFT Marketplace</p>
        {/* <h1 className='text-blue-600'>NFT Marketplace</h1> */}
        <div className="flex mt-4">
          <Link href="/">
            <a className="mr-4 text-white">
              Marketplace
            </a>
          </Link>
          <Link href="/create-item">
            <a className="mr-6 text-white">
              Sell Digital Product
            </a>
          </Link>-
          <Link href="/my-assets">
            <a className="mr-6 text-white">
              My Digital Assets
            </a>
          </Link>
          <Link href="/creator-dashboard">
            <a className="mr-6 text-white">
              Creator Dashboard
            </a>
          </Link>
          {/* <div> */}
        <Link href="https://faucet.polygon.technology/">
            <a target="_blank" className="text-right text-white ">
              MATIC Faucet
            </a>
          </Link>
        {/* </div> */}
        </div>
        
      </nav>
    </>
  )
}

export default Nav