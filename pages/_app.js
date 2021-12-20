/* pages/_app.js */
import '../styles/globals.css';
import Nav from '../components/Navbar';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Nav />
      <Component {...pageProps} />      
    </>
  )
}

export default MyApp