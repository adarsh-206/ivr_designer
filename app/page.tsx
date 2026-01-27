"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 font-sans">
      <main className="flex flex-col items-center justify-center w-full max-w-4xl p-12 bg-white rounded-3xl shadow-xl sm:p-16">
        <div className="flex flex-col items-center gap-6 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Welcome to Claritel
          </h1>
          <p className="max-w-md text-gray-600 text-lg">
            Build and design your IVR flows easily with our intuitive designer.
          </p>
          <button
            onClick={() => router.push("/ivr-designer")}
            className="mt-6 px-10 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
          >
            Go to IVR Designer
          </button>
        </div>
      </main>
    </div>
  );
}
