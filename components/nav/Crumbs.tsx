import Image from "next/image";
import Arrow from "@/components/assets/arrow.svg";
import Link from "next/link";

export default function Crumbs({
  backUrl,
  previousLabel,
  currentLabel,
}: {
  backUrl: string;
  previousLabel?: string;
  currentLabel?: string;
}) {
  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol role="list" className="flex items-center ">
        <li>
          <div>
            <Link href="/private-cloud/products">
              <Image
                alt="Arrow"
                src={Arrow}
                width={25}
                height={25}
                style={{
                  maxWidth: "100%",
                  height: "auto",
                }}
              />
            </Link>
          </div>
        </li>
        <li>
          <div className="flex items-center">
            <a className="ml-4 font-bcsans text-xl font-medium text-gray-500">
              {previousLabel}
            </a>
            {previousLabel && (
              <svg
                className="h-5 w-5 flex-shrink-0 text-gray-300"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
              </svg>
            )}
          </div>
        </li>
        <li>
          <div className="flex items-center font-bcsans text-xl">
            {currentLabel}
          </div>
        </li>
      </ol>
    </nav>
  );
}
