export default function SubmitButton({
  text,
  disabled = false,
  onClick,
}: {
  text: string;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return disabled ? (
    <button
      onClick={onClick}
      disabled
      type="submit"
      className="inline-flex justify-center rounded-md bg-bcorange/50 px-4 py-2.5 text-bcblue text-sm tracking-[.2em] shadow-sm brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 col-start-2"
    >
      {text}
    </button>
  ) : (
    <button
      onClick={onClick}
      type="submit"
      className="flex rounded-md bg-bcorange px-4 py-2.5 text-bcblue text-sm tracking-[.2em] shadow-sm hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
    >
      {text}
    </button>
  );
}
