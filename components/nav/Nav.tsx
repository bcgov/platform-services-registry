import Image from "next/image";
import Logo from "@/components/assets/logo.svg";
import ProfileDropdown from "@/components/nav/ProfileDropdown";
import Link from "next/link";

export default function NavBar() {
  return (
    <nav className="border-b-3 border-bcorange bg-bcblue shadow">
      <div
        style={{ height: 65 }}
        className="test mx-auto border-y-4 border-bcblue px-2 sm:px-6 lg:px-8"
      >
        <div className="relative flex h-14 justify-between px-12">
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
            {/* Mobile menu button */}
          </div>
          <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
            <div className="flex flex-shrink-0 items-center">
             <Link href="/private-cloud/products">

                <Image
                  alt="BC Platform Services Product Registry"
                  src={Logo}
                  width={56}
                  height={50}
                  style={{
                    maxWidth: "100%",
                    height: "auto"
                  }}
                />
              </Link>
              <span className="ml-5 hidden items-center text-2xl leading-none text-white md:inline">
                <span className="mr-2 font-roboto font-thin">
                  BC Plaftorm Services
                </span>
                <span className="font-roboto font-normal">
                  Product Registry
                </span>
              </span>
            </div>
          </div>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
            <ProfileDropdown />
          </div>
        </div>
      </div>
    </nav>
  );
}
