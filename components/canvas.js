import * as React from "react";
import { useEffect } from "react";
import { ReactSketchCanvas } from "react-sketch-canvas";

import { Undo as UndoIcon, Trash as TrashIcon } from "lucide-react";

export default function Canvas({
  onScribble,
  scribbleExists,
  setScribbleExists,
  isScribblerPressed,
}) {
  const canvasRef = React.useRef(null);

  useEffect(() => {
    loadStartingPaths();
  }, []);

  async function loadStartingPaths() {
    //await canvasRef.current.loadPaths(startingPaths);
    setScribbleExists(true);
    onChange();
  }

  const onChange = async () => {
    const paths = await canvasRef.current.exportPaths();
    localStorage.setItem("paths", JSON.stringify(paths, null, 2));

    if (!paths.length) return;

    setScribbleExists(true);

    const data = await canvasRef.current.exportImage("png");
    onScribble(data);
  };

  const undo = () => {
    canvasRef.current.undo();
  };

  const reset = () => {
    setScribbleExists(false);
    canvasRef.current.resetCanvas();
  };

  return (
    <div className="relative">
      {scribbleExists || (
        <div>
          <div className="absolute grid w-full h-full p-3 place-items-center pointer-events-none text-xl">
            <span className="opacity-40">Draw something here.</span>
          </div>
        </div>
      )}

      <ReactSketchCanvas
        ref={canvasRef}
        className="w-full aspect-square border-none cursor-crosshair"
        strokeWidth={4}
        strokeColor="black"
        onChange={onChange}
        withTimestamp={true}
        style={{ display: isScribblerPressed ? "block" : "none" }}
      />

      {scribbleExists && (
        <div
          className="animate-in fade-in duration-700 text-left"
          style={{ display: isScribblerPressed ? "block" : "none" }}
        >
          <button className="lil-button" onClick={undo}>
            <UndoIcon className="icon" />
            Undo
          </button>
          <button className="lil-button" onClick={reset}>
            <TrashIcon className="icon" />
            Clear
          </button>
        </div>
      )}
    </div>
  );
}
