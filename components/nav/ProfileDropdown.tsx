"use client";

import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import classNames from "@/components/utils/classnames";
import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import generateAvatar from './generateAvatar'

async function fetchUserImage(email: string): Promise<string> {
  const res = await fetch(`/api/msal/userImage?email=${email}`);
  if (!res.ok) {
    throw new Error("Network response was not ok for fetch user image");
  }
  
  if(res.headers.get("Content-Type")){
    // Assuming server returns a blob of image data
    const blob = await res.blob();
    
    // Create a URL from the blob
    const imageUrl = URL.createObjectURL(blob);

    return imageUrl;
  }
  else{
    const imageUrl = await generateAvatar(email)

    return imageUrl
  }
}

export default function ProfileDropdown() {
  const { data: session, status } = useSession();
  const email = session?.user?.email;

  const { data, isLoading, error } = useQuery<string, Error>(
    ["userImage", email],
    () => fetchUserImage(email),
    {
      enabled: !!email,
    }
  );

  return (
    <Menu as="div" className="relative ml-3">
      <div>
        <Menu.Button className="flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
          <span className="sr-only">Open user menu</span>
          <img
            className="h-10 w-10 rounded-full"
            src={data || "http://www.gravatar.com/avatar/?d=identicon"}
            alt=""
          />
        </Menu.Button>
      </div>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <Menu.Item>
            {({ active }) => (
              <Link
                href="#"
                className={classNames(
                  active ? "bg-gray-100" : "",
                  "block px-4 py-2 text-sm text-gray-700"
                )}
              >
                Your Profile
              </Link>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <Link
                href="#"
                className={classNames(
                  active ? "bg-gray-100" : "",
                  "block px-4 py-2 text-sm text-gray-700"
                )}
              >
                Settings
              </Link>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <div>
                {status !== "authenticated" ? (
                  <Link
                    href="#"
                    onClick={() =>
                      signIn("keycloak", {
                        callbackUrl: "/private-cloud/products",
                      })
                    }
                    className={classNames(
                      active ? "bg-gray-100" : "",
                      "block px-4 py-2 text-sm text-gray-700"
                    )}
                  >
                    Sign In
                  </Link>
                ) : (
                  <Link
                    href="#"
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className={classNames(
                      active ? "bg-gray-100" : "",
                      "block px-4 py-2 text-sm text-gray-700"
                    )}
                  >
                    Sign out
                  </Link>
                )}
              </div>
            )}
          </Menu.Item>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
