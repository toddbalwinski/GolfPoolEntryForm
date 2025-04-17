// pages/_app.js
import '../styles/globals.css';      // ← your Tailwind/CSS entrypoint

export default function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}
