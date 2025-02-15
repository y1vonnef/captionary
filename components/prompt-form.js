import { useEffect, useState } from "react";

export default function PromptForm({
  initialPrompt,
  onSubmit,
  scribbleExists,
}) {
  const [prompt, setPrompt] = useState(initialPrompt);

  const disabled = !(scribbleExists && prompt?.length > 0);

  useEffect(() => {
    setPrompt(initialPrompt);
  }, [initialPrompt]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <form onSubmit={handleSubmit} className="animate-in fade-in duration-700">
      <p>
        <strong>Please draw the following prompt:</strong>
      </p>
      <div className="flex mt-4 mb-5">
        <input
          id="prompt-input"
          type="text"
          name="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the image you want to create..."
          className="block w-full flex-grow rounded-l-md border-none"
          disabled={true}
        />

        <button
          className={`bg-black text-white rounded-md text-small inline-block px-5 py-3 flex-none ${
            disabled ? "opacity-20 cursor-not-allowed	" : ""
          }`}
          type="submit"
          disabled={disabled}
        >
          Done
        </button>
      </div>
    </form>
  );
}
