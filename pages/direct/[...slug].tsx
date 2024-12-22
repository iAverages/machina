import { GetServerSidePropsContext } from "next";
import { getTrackData } from "../../og/get-track-data";

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const trackId = context.params.slug[3];
  const data = await getTrackData(trackId);

  return {
    redirect: {
      destination: data.og,
      permanent: false,
    },
  };
}
export default function Page() {
  return <>nothing to see here</>;
}
