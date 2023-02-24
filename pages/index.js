import Canvas from "components/canvas";
import PromptForm from "components/prompt-form";
import Head from "next/head";
import { useState } from "react";
import Predictions from "components/predictions";
import Error from "components/error";
import uploadFile from "lib/upload";
import Script from "next/script";
import seeds from "lib/seeds";
import pkg from "../package.json";
import sleep from "lib/sleep";

const HOST = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export default function Home() {
  const [error, setError] = useState(null);
  const [submissionCount, setSubmissionCount] = useState(0);
  const [predictions, setPredictions] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [scribbleExists, setScribbleExists] = useState(false);
  const [seed] = useState(seeds[Math.floor(Math.random() * seeds.length)]);
  const [initialPrompt] = useState(seed.prompt);
  const [scribble, setScribble] = useState(null);

  //game code
  const [isScribblerPressed, setIsScribblerPressed] = useState(false);
  const [isPromptGuesserPressed, setIsPromptGuesserPressed] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // track submissions so we can show a spinner while waiting for the next prediction to be created
    setSubmissionCount(submissionCount + 1);

    const prompt = e.target.prompt.value;

    setError(null);
    setIsProcessing(true);

    const fileUrl = await uploadFile(scribble);

    const body = {
      prompt,
      image: fileUrl,
    };

    const response = await fetch("/api/predictions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    let prediction = await response.json();

    setPredictions((predictions) => ({
      ...predictions,
      [prediction.id]: prediction,
    }));

    if (response.status !== 201) {
      setError(prediction.detail);
      return;
    }

    while (
      prediction.status !== "succeeded" &&
      prediction.status !== "failed"
    ) {
      await sleep(500);
      const response = await fetch("/api/predictions/" + prediction.id);
      prediction = await response.json();
      setPredictions((predictions) => ({
        ...predictions,
        [prediction.id]: prediction,
      }));
      if (response.status !== 200) {
        setError(prediction.detail);
        return;
      }
    }

    setIsProcessing(false);
  };

  const handleScribbler = () => {
    setIsScribblerPressed(true);
  };

  const handlePromptGuesser = () => {
    setIsPromptGuesserPressed(true);
  };

  return (
    <div>
      <Head>
        <meta name="description" content={pkg.appMetaDescription} />
        <meta property="og:title" content={pkg.appName} />
        <meta property="og:description" content={pkg.appMetaDescription} />
        <meta
          property="og:image"
          content={`${HOST}/og-b7xwc4g4wrdrtneilxnbngzvti.png`}
        />
        <title>{pkg.appName}</title>s
      </Head>
      <main className="container max-w-[1024px] mx-auto p-5 ">
        <div className="container max-w-[512px] mx-auto">
          <hgroup>
            <h1 className="text-center text-5xl font-bold m-4">
              {pkg.appName}
            </h1>
            <p className="text-center text-xl opacity-60 m-4">
              {pkg.appSubtitle}
            </p>
          </hgroup>
          <div className="flex justify-around">
            <button
              className="rounded-md bg-slate-900 px-8 py-4 text-white mb-10 disabled:opacity-75"
              onClick={() => handleScribbler()}
              disabled={isPromptGuesserPressed}
            >
              Scribbler
            </button>
            <button
              className="rounded-md bg-slate-900 px-8 py-4 text-white mb-10 disabled:opacity-75"
              onClick={() => handlePromptGuesser()}
              disabled={isScribblerPressed}
            >
              Prompt Guesser
            </button>
          </div>
          {isPromptGuesserPressed && (
            <input className="block w-full flex-grow rounded-l-md"></input>
          )}

          <Canvas
            // startingPaths={seed.paths}
            onScribble={setScribble}
            scribbleExists={scribbleExists}
            setScribbleExists={setScribbleExists}
            isScribblerPressed={isScribblerPressed}
          />

          <PromptForm
            initialPrompt={initialPrompt}
            onSubmit={handleSubmit}
            isProcessing={isProcessing}
            scribbleExists={scribbleExists}
          />

          <Error error={error} />
        </div>

        <Predictions
          predictions={predictions}
          isProcessing={isProcessing}
          submissionCount={submissionCount}
        />
      </main>

      <Script src="https://js.upload.io/upload-js-full/v1" />
    </div>
  );
}
