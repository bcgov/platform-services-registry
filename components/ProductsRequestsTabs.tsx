"use client";

import React, { useState } from "react";

export default function Tabs(props: any) {
  const [selected, setSelected] = useState("Products");

  return (
    <span className="isolate inline-flex rounded-md h-10 mt-8">
      <button
        style={{ width: 97 }}
        type="button"
        className={`pl-4 relative inline-flex items-center rounded-l-lg px-3 py-2 text-sm font-semibold ring-1 ring-inset ring-bcblue focus:z-10 
          ${
            selected === "Products"
              ? "bg-bcblue text-white"
              : "bg-white text-gray-900 hover:bg-gray-100"
          }`}
        onClick={() => setSelected("Products")}
      >
        Products
      </button>
      <button
        style={{ width: 97 }}
        type="button"
        className={`pl-4 relative -ml-px inline-flex items-center rounded-r-lg px-3 py-2 text-sm font-semibold ring-1 ring-inset ring-bcblue focus:z-10 
          ${
            selected === "Requests"
              ? "bg-bcblue text-white"
              : "bg-white text-gray-900 hover:bg-gray-100"
          }`}
        onClick={() => setSelected("Requests")}
      >
        Requests
      </button>
    </span>
  );
}
