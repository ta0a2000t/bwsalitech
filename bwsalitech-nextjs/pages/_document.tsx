import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    // --- MODIFICATION START ---
    // Set the default language and direction here to match the initial state ('ar').
    // This prevents the initial LTR flash and ensures correct button alignment on load.
    <Html lang="ar" dir="rtl">
    {/* --- MODIFICATION END --- */}
      <Head>
        {/* Preconnect for fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" /> {/* Use anonymous instead of true */}
        {/* Cairo Font */}
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap" rel="stylesheet" />
        {/* Font Awesome */}
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" integrity="sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw==" crossOrigin="anonymous" referrerPolicy="no-referrer" />
        {/* Add other meta tags, favicons etc. here */}
        {/* <link rel="icon" href="/favicon.ico" /> */}
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}