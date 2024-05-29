import { useRouter } from 'next/navigation';

export default function Previous() {
  const router = useRouter();

  return (
    <button
      className="px-12 rounded-md bg-white tracking-[.2em] py-2.5 text-sm text-bcblue shadow-sm ring-1 ring-inset ring-bcblue hover:bg-gray-50"
      type="button"
      onClick={() => router.back()}
    >
      PREVIOUS
    </button>
  );
}
