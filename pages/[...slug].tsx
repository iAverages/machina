import { GetServerSidePropsContext } from "next";
import Head from "next/head";

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const og =
    "/api/og?albumArt=https%3A%2F%2Fimage-cdn-ak.spotifycdn.com%2Fimage%2Fab67616d00001e0218285df0b7581a0fcc806afc&artist=%E5%A0%95%E5%A4%A9&songName=Creepy%20Nuts";

  return {
    props: {
      og,
    },
  };
}
export default function Page({ og }: { og: string }) {
  return (
    <div>
      <Head>
        <meta name="og:title" content="Vercel Edge Network" />
        <meta name="og:description" content="Vercel Edge Network" />
        <meta
          name="og:image"
          content={
            // Because OG images must have a absolute URL, we use the
            // `VERCEL_URL` environment variable to get the deployment’s URL.
            // More info:
            // https://vercel.com/docs/concepts/projects/environment-variables
            `${
              process.env.VERCEL_URL ? "https://" + process.env.VERCEL_URL : ""
            }${og}`
          }
        />
      </Head>
      <div>path shit</div>
    </div>
  );
}
