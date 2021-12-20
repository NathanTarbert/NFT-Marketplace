import Link from 'next/link';

function Nav() {
  return (
    <>
      <nav className="border-b shadow-md p-6">      
        <p className="text-4xl text-sky-900 font-bold">NFT Marketplace</p>
        {/* <h1 className='text-blue-600'>NFT Marketplace</h1> */}
        <div className="flex mt-4">
          <Link href="/">
            <a className="mr-4 text-teal-400">
              Home
            </a>
          </Link>
          <Link href="/create-item">
            <a className="mr-6 text-teal-400">
              Sell Digital Asset
            </a>
          </Link>-
          <Link href="/my-assets">
            <a className="mr-6 text-teal-400">
              My Digital Assets
            </a>
          </Link>
          <Link href="/creator-dashboard">
            <a className="mr-6 text-teal-400">
              Creator Dashboard
            </a>
          </Link>
        </div>
      </nav>
    </>
  )
}

export default Nav