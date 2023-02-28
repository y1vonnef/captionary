import Canvas from "components/canvas";
import PromptForm from "components/prompt-form";
import GuesserForm from "components/guesser-form";
import Head from "next/head";
import { useState, useEffect } from "react";
import Predictions from "components/predictions";
import Error from "components/error";
import uploadFile from "lib/upload";
import Script from "next/script";
import seeds from "lib/seeds";
import pkg from "../package.json";
import sleep from "lib/sleep";
import io from "socket.io-client";
import SocketContext from "components/socket-context";
import { output } from "next.config";
import prompt_map from "lib/prompt_map";

const HOST =
  process.env.NODE_ENV == "production"
    ? `https://captionary-mlart.herokuapp.com/`
    : "http://localhost:3000";

// const HOST = "http://localhost:3000";

const ENDPOINT =
  process.env.NODE_ENV == "production"
    ? `https://captionary-server.herokuapp.com/`
    : "http://localhost:80";

const connectionOptions = {
  "force new connection": true,
  reconnectionAttempts: "Infinity", //avoid having user reconnect manually in order to prevent dead clients after a server restart
  timeout: 10000, //before connect_error and connect_timeout are emitted.
  pingInterval: 15000,
  pingTimeout: 30000,
  transports: ["websocket"],
  autoconnect: true,
};

const socket = io(connectionOptions);

export default function Home() {
  const [error, setError] = useState(null);
  const [submissionCount, setSubmissionCount] = useState(0);
  const [guessCount, setGuessCount] = useState(0);
  const [predictions, setPredictions] = useState({});
  const [sketchScore, setSketchScore] = useState(null);
  const [outputScore, setOutputScore] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scribbleExists, setScribbleExists] = useState(false);
  const [seed] = useState(seeds[Math.floor(Math.random() * seeds.length)]);
  const [initialPrompt] = useState(seed.prompt);
  const [initialPromptID] = useState(prompt_map[initialPrompt]);
  const [scribble, setScribble] = useState(null);

  //game code
  const [isScribblerPressed, setIsScribblerPressed] = useState(false);
  const [isPromptGuesserPressed, setIsPromptGuesserPressed] = useState(false);
  const [prompt, setPrompt] = useState(null);

  const handleSubmit = async (e) => {
    if (prompt == null) {
      alert("guesser hasn't guessed yet!");
      return;
    }
    console.log("guess count is now " + guessCount);
    console.log("submission count is now " + submissionCount);

    if (guessCount != submissionCount + 1) {
      alert("guesser has not submitted another guess, are you sure?");
    }
    e.preventDefault();

    // track submissions so we can show a spinner while waiting for the next prediction to be created
    setSubmissionCount(submissionCount + 1);
    //ADDED
    socket.emit("submission", submissionCount + 1);

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

    console.log("prediction input url: " + prediction.input.image);

    if (response.status !== 201) {
      setError(prediction.detail);
      socket.emit("prediction_failed");
      return;
    }

    while (
      prediction.status !== "succeeded" &&
      prediction.status !== "failed"
    ) {
      await sleep(500);
      const response = await fetch("/api/predictions/" + prediction.id);
      prediction = await response.json();
      //ADDED
      console.log(prediction.id);
      socket.emit("prediction_done", prediction);
      setPredictions((predictions) => ({
        ...predictions,
        [prediction.id]: prediction,
      }));
      if (response.status !== 200) {
        setError(prediction.detail);
        socket.emit("prediction_failed");
        return;
      }
    }

    console.log("prediction output url: " + prediction.output[prediction.output.length - 1]);
    console.log("initial prompt id" + initialPromptID);

    const sketch_api_url = 'http://172.26.66.105:8000/score?image_url=' + prediction.input.image + '&id=' + initialPromptID;
    const output_api_url = 'http://172.26.66.105:8000/score?image_url=' +  prediction.output[prediction.output.length - 1] + '&id=' + initialPromptID;

    // idk if this is the best place to have this ?? tbh idk where to put it in general
    // to do this properly need the output image link, and the prompt mapped to the id (idk where to get the prompt from here just yet)
    // if you just run this normally you'll see the scribbler tab console log 0 or 1 
    const sketch_score = await fetch(sketch_api_url)
         .then((response) => response.json())
         .then((data) => {
            console.log(data);
            setSketchScore(data);
         })
         .catch((err) => {
            console.log(err.message);
         });
    
    const output_score = await fetch(output_api_url)
         .then((response) => response.json())
         .then((data) => {
            console.log(data);
            setOutputScore(data);
         })
         .catch((err) => {
            console.log(err.message);
         });
    

    console.log("sketch score: " + sketchScore);
    console.log("output score: " + outputScore);

    //ADDED
    // socket.emit("prediction_done", predictions);
    console.log("predictions returned");
    setIsProcessing(false);
  };

  // send scribbler or guesser identity to server on button press
  const handleScribbler = () => {
    setIsScribblerPressed(true);
    socket.emit("is_scribbler", true);
  };

  const handlePromptGuesser = () => {
    setIsPromptGuesserPressed(true);
    socket.emit("is_guesser", true);
  };

  useEffect(() => {
    socket.on("have_guessed", (data) => {
      //OK SO 'data' IS THE TEXT INPUT TO THE MODEL
      console.log("i am the scribbler and i have the guess and it is" + data);
      setPrompt(data);
      setGuessCount(guessCount + 1);
    });
    socket.on("have_predicted", (data) => {
      //ADDED
      console.log("predictions have returned from scribbler!!" + data.id);
      setPredictions((predictions) => ({
        ...predictions,
        [data.id]: data,
      }));
      console.log(predictions);
    });
    //ADDED
    socket.on("submission_received", (data) => {
      setSubmissionCount(data);
      console.log("submission count is now " + submissionCount);
      console.log(submissionCount);
    });
    return () => {};
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      <div>
        <Head>
          <meta name="description" content={pkg.appMetaDescription} />
          <meta property="og:title" content={pkg.appName} />
          <meta property="og:description" content={pkg.appMetaDescription} />
          <meta
            property="og:image"
            content={`${HOST}/og-b7xwc4g4wrdrtneilxnbngzvti.png`}
          />
          <title>{pkg.appName}</title>
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
                className="rounded-md bg-slate-900 px-8 py-4 text-white mb-5 disabled:opacity-25"
                onClick={() => handleScribbler()}
                disabled={isPromptGuesserPressed}
              >
                Scribbler
              </button>
              <button
                className="rounded-md bg-slate-900 px-8 py-4 text-white mb-5 disabled:opacity-25"
                onClick={() => handlePromptGuesser()}
                disabled={isScribblerPressed}
              >
                Prompt Guesser
              </button>
            </div>
            {isPromptGuesserPressed && (
              <SocketContext.Consumer>
                {(socket) => <GuesserForm socket={socket} />}
              </SocketContext.Consumer>
            )}
            {isScribblerPressed && (
              <PromptForm
                initialPrompt={initialPrompt}
                onSubmit={handleSubmit}
                isProcessing={isProcessing}
                scribbleExists={scribbleExists}
              />
            )}
            <Canvas
              // startingPaths={seed.paths}
              onScribble={setScribble}
              scribbleExists={scribbleExists}
              setScribbleExists={setScribbleExists}
              isScribblerPressed={isScribblerPressed}
            />
            {/* <PromptForm
              initialPrompt={initialPrompt}
              onSubmit={handleSubmit}
              isProcessing={isProcessing}
              scribbleExists={scribbleExists}
            /> */}
            <Error error={error} />
          </div>
          <Predictions
            predictions={predictions}
            isProcessing={isProcessing}
            submissionCount={submissionCount}
            isScribblerPressed={isScribblerPressed}
            sketchScore={sketchScore}
            outputScore={outputScore}
          />
          <div>{submissionCount}</div>
          {/* {Object.values(predictions)
            .slice()
            .reverse()
            .map((prediction, index) => (
              <Fragment key={prediction.id}>
                {index === 0 &&
                  submissionCount == Object.keys(predictions).length && <div />}
              </Fragment>
            ))}
          <div className="w-1/2 aspect-square relative">
            {predictions.output?.length ? (
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
          </div> */}
        </main>

        <Script src="https://js.upload.io/upload-js-full/v1" />
      </div>
    </SocketContext.Provider>
  );
}
