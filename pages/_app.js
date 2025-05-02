// pages/_app.js
import '../styles/globals.css';
import 'react-quill/dist/quill.snow.css';    // ← add this

export default function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}
