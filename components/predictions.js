import copy from "copy-to-clipboard";
import { Copy as CopyIcon, PlusCircle as PlusCircleIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Fragment, useEffect, useRef, useState } from "react";
import Loader from "components/loader";

export default function Predictions({
  predictions,
  submissionCount,
  isScribblerPressed,
  sketchScore,
  outputScore,
}) {
  const scrollRef = useRef(null);

  useEffect(() => {
    //console.log("HERE " + submissionCount);
    if (submissionCount > 0) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [predictions, submissionCount]);

  if (submissionCount === 0) return;

  return (
    <section className="w-full my-10">
      <h2 className="text-center text-3xl font-bold m-6">Results</h2>

      {submissionCount > Object.keys(predictions).length && (
        <div className="pb-10 mx-auto w-full text-center">
          <div className="pt-10" ref={scrollRef} />
          <Loader />
        </div>
      )}

      {Object.values(predictions)
        .slice()
        .reverse()
        .map((prediction, index) => (
          <Fragment key={prediction.id}>
            {index === 0 &&
              submissionCount == Object.keys(predictions).length && (
                <div ref={scrollRef} />
              )}
            <Prediction
              prediction={prediction}
              isScribblerPressed={isScribblerPressed}
              sketchScore={sketchScore}
              outputScore={outputScore}
            />
          </Fragment>
        ))}
    </section>
  );
}

export function Prediction({
  prediction,
  isScribblerPressed,
  showLinkToNewScribble = false,
  sketchScore,
  outputScore,
}) {
  const [linkCopied, setLinkCopied] = useState(false);

  const copyLink = () => {
    const url = window.location.origin + "/scribbles/" + prediction.id;
    copy(url);
    setLinkCopied(true);
  };

  // Clear the "Copied!" message after 4 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      setLinkCopied(false);
    }, 4 * 1000);

    return () => clearInterval(intervalId);
  }, []);

  if (!prediction) return null;

  return (
    <div className="mt-6 mb-12">
      <div className="shadow-lg border my-5 p-5 bg-white flex justify-center">
        <div
          className="w-1/2 aspect-square relative border"
          style={{ width: isScribblerPressed ? "50%" : "auto" }}
        >
          <img
            src={prediction.input.image}
            alt="input scribble"
            className="w-full aspect-square"
            style={{ display: isScribblerPressed ? "block" : "none" }}
          />
        </div>
        <div className="w-1/2 aspect-square relative">
          {prediction.output?.length ? (
            <img
              src={prediction.output[prediction.output.length - 1]}
              alt="output image"
              className="w-full aspect-square"
            />
          ) : (
            <div className="grid h-full place-items-center">
              <Loader />
            </div>
          )}
        </div>
      </div>
      <div className="text-center px-4 opacity-60 text-xl">
        Your sketch score is: {sketchScore}
      </div>
      {/* <div className="text-center py-2">

        {showLinkToNewScribble && (
          <Link href="/">
            <button className="lil-button" onClick={copyLink}>
              <PlusCircleIcon className="icon" />
              Create a new scribble
            </button>
          </Link>
        )}
      </div> */}
    </div>
  );
}
