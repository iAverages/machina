import Head from "next/head";

// <meta name="og:title" content={track.name} />
// <meta name="og:description" content={track.artists[0].name} //>
// <meta name="og:image" content={og} //>
//
// <meta name="twitter:card" content="summary_large_image" //>
// <meta name="twitter:title" content={track.name} //>
// <meta name="twitter:description" content={track.artists[0].name} //>
// <meta name="twitter:image" content={og} //>

const Dan = () => {
  return (
    <>
      <Head>
        <meta property="og:site_name" content="og:site_name" />
        <meta property="og:title" content="og:title" />
        <meta property="og:description" content="og:description" />
        <meta property="description" content="description" />
        <meta property="og:url" content="https://danielraybone.com" />
        <meta property="theme-color" content="#7e22ce" />
        <meta property="og:image" content="https://avrg.dev/a3nUaH.png" />
        <meta property="og:type" content="video" />
        <meta
          property="og:video"
          content="https://s-video.kirsi.dev/1EKldZ895Jw4k4Rh1ajVo8"
        />
        <meta property="og:video:type" content="video/mp4" />
        <meta property="og:video:height" content="800" />
        <meta property="og:video:width" content="300" />
        <meta
          property="og:video:secure_url"
          content="https://s-video.kirsi.dev/1EKldZ895Jw4k4Rh1ajVo8"
        />
      </Head>
      <div>testing</div>
    </>
  );
};

export default Dan;
