"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Home() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [showRegisterDialog, setShowRegisterDialog] = useState<boolean>(false);
  const [registerData, setRegisterData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    birthDate: "",
    genderId: 1, // 1: Male, 2: Female
    password: ""
  });
  const router = useRouter();

  const login = async (email: string, password: string) => {
    const response = await fetch("http://localhost:3000/admin/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const { message } = await response.json();
      throw new Error(message || "Login failed");
    }

    return response.json();
  };

  const register = async (data: typeof registerData) => {
    const response = await fetch("http://localhost:3000/admin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const { message } = await response.json();
      throw new Error(message || "Registration failed");
    }

    return response.json();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await login(email, password);
      const { admin, token } = result;
      localStorage.setItem("admin", JSON.stringify(admin));
      localStorage.setItem("authToken", token);
      setSuccess(true);
      setEmail("");
      setPassword("");

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const result = await register(registerData);
      setShowRegisterDialog(false);
      // Handle success (e.g., show a success message, redirect, etc.)
      alert("Registration successful!");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    }
  };

  return (
    <div className="flex h-screen items-center justify-center p-10">
      <div className="xl:w-1/2 rounded-2xl border border-blue-800 md:shadow-xl">
        <div className="grid md:grid-cols-2 p-5">
          <div>
            <Image
              src="/8333958.webp"
              alt="Login Illustration"
              width={500}
              height={500}
            />
          </div>
          <div>
            <div className="flex items-center justify-center">
              <form onSubmit={handleSubmit} className="w-full">
                <h1 className="text-center font-extrabold uppercase text-rose-500">Admin Login</h1>
                <br />
                <input
                  type="email"
                  className="mb-3 w-full rounded-2xl bg-zinc-100 outline-rose-400 px-5 py-3"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <input
                  type="password"
                  className="mb-3 w-full rounded-2xl bg-zinc-100 outline-rose-400 px-5 py-3"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                <button
                  type="submit"
                  className="mb-3 w-full rounded-2xl bg-rose-500 px-5 py-3 font-semibold text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Logging in..." : "Login"}
                </button>

                {error && <p className="mt-3 text-center text-red-500">{error}</p>}
                {success && (
                  <p className="mt-3 text-center text-green-500">Login successful!</p>
                )}
              </form>
            </div>
            <div className="flex justify-center mt-4">
              <a
                onClick={() => setShowRegisterDialog(true)}
                className="text-sm text-blue-500 underline cursor-pointer"
              >
                Register
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Register Dialog */}
      {showRegisterDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-1/3">
            <h2 className="text-center font-bold text-xl mb-4">Register</h2>
            <form onSubmit={handleRegisterSubmit}>
              <input
                type="text"
                className="mb-3 w-full rounded-2xl bg-zinc-100 outline-rose-400 px-5 py-3"
                placeholder="First Name"
                value={registerData.firstName}
                onChange={(e) =>
                  setRegisterData({ ...registerData, firstName: e.target.value })
                }
              />
              <input
                type="text"
                className="mb-3 w-full rounded-2xl bg-zinc-100 outline-rose-400 px-5 py-3"
                placeholder="Last Name"
                value={registerData.lastName}
                onChange={(e) =>
                  setRegisterData({ ...registerData, lastName: e.target.value })
                }
              />
              <input
                type="email"
                className="mb-3 w-full rounded-2xl bg-zinc-100 outline-rose-400 px-5 py-3"
                placeholder="Email"
                value={registerData.email}
                onChange={(e) =>
                  setRegisterData({ ...registerData, email: e.target.value })
                }
              />
              <input
                type="date"
                className="mb-3 w-full rounded-2xl bg-zinc-100 outline-rose-400 px-5 py-3"
                value={registerData.birthDate}
                onChange={(e) =>
                  setRegisterData({ ...registerData, birthDate: e.target.value })
                }
              />
              <select
                className="mb-3 w-full rounded-2xl bg-zinc-100 outline-rose-400 px-5 py-3"
                value={registerData.genderId}
                onChange={(e) =>
                  setRegisterData({ ...registerData, genderId: Number(e.target.value) })
                }
              >
                <option value={1}>Male</option>
                <option value={2}>Female</option>
              </select>
              <input
                type="password"
                className="mb-3 w-full rounded-2xl bg-zinc-100 outline-rose-400 px-5 py-3"
                placeholder="Password"
                value={registerData.password}
                onChange={(e) =>
                  setRegisterData({ ...registerData, password: e.target.value })
                }
              />

              <button
                type="submit"
                className="w-full rounded-2xl bg-rose-500 px-5 py-3 font-semibold text-white"
              >
                Register
              </button>
            </form>
            <button
              onClick={() => setShowRegisterDialog(false)}
              className="mt-4 w-full rounded-2xl bg-gray-400 text-white py-2"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
