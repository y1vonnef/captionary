import Link from "next/link";

export default function Footer({ events }) {
  return (
    <footer className="w-full my-8">
      <div className="text-center lil-text mt-8">
        Powered by{" "}
        <Link href="https://github.com/lllyasviel/ControlNet" target="_blank">
          ControlNet
        </Link>{" "}
        by{" "}
        <Link
          href="https://lllyasviel.github.io/Style2PaintsResearch/lvmin"
          target="_blank"
        >
          Lyumin Zhang
        </Link>
        ,{" "}
        <Link
          href="https://replicate.com/jagilley/controlnet-scribble?utm_source=project&utm_campaign=scribblediffusion"
          target="_blank"
        >
          Replicate
        </Link>
        ,{" "}
        <Link href="https://vercel.com/templates/ai" target="_blank">
          Vercel
        </Link>
        , and{" "}
        <Link href="https://upload.io" target="_blank">
          Upload
        </Link>
        .
      </div>
    </footer>
  );
}
