import type { AppProps } from 'next/app';
import '../styles/globals.css';
// import Layout from '../components/Layout'; // Uncomment if using Layout

function MyApp({ Component, pageProps }: AppProps) {
  // If using Layout component:
  // return (
  //   <Layout>
  //     <Component {...pageProps} />
  //   </Layout>
  // );

  // Without Layout component:
  return <Component {...pageProps} />;
}

export default MyApp;