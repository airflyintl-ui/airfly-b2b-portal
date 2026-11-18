"use client";

import { useState } from "react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const subject = encodeURIComponent(
      `Website Contact Message from ${name}`
    );

    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\n\nMessage:\n${message}`
    );

    window.location.href = `mailto:airflyintl@gmail.com?subject=${subject}&body=${body}`;
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="bg-blue-700 py-16 px-5 text-center text-white">
        <h1 className="text-4xl font-bold mb-4">Contact Airfly International</h1>
        <p className="text-blue-100 text-lg">
          We are here to help you with your travel needs.
        </p>
      </section>

      <section className="max-w-6xl mx-auto px-5 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Contact Information
            </h2>

            <div className="space-y-5">

              <div className="bg-white p-5 rounded-xl shadow-sm">
                <h3 className="font-bold text-blue-700 text-lg mb-2">
                  📍 Office Address
                </h3>
                <p className="text-gray-600 leading-7">
                  598/A, Shamsuddin Tower (2nd Floor),
                  <br />
                  Reazuddin Bazar, Chattogram
                </p>
              </div>

              <div className="bg-white p-5 rounded-xl shadow-sm">
                <h3 className="font-bold text-blue-700 text-lg mb-2">
                  ☎ Telephone
                </h3>
                <a href="tel:02333366085" className="text-gray-700 hover:text-blue-700">
                  02-333366085
                </a>
              </div>

              <div className="bg-white p-5 rounded-xl shadow-sm">
                <h3 className="font-bold text-blue-700 text-lg mb-2">
                  📱 Mobile
                </h3>
                <a href="tel:01819316705" className="text-gray-700 hover:text-blue-700">
                  01819316705
                </a>
              </div>

              <div className="bg-white p-5 rounded-xl shadow-sm">
                <h3 className="font-bold text-blue-700 text-lg mb-2">
                  ✉ Email
                </h3>
                <a
                  href="mailto:airflyintl@gmail.com"
                  className="text-gray-700 hover:text-blue-700"
                >
                  airflyintl@gmail.com
                </a>
              </div>

              <div className="bg-white p-5 rounded-xl shadow-sm">
                <h3 className="font-bold text-green-600 text-lg mb-2">
                  WhatsApp
                </h3>
                <a
                  href="https://wa.me/8801711304917"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold"
                >
                  Chat on WhatsApp: 01711304917
                </a>
              </div>

            </div>
          </div>

          <div className="bg-white p-7 rounded-xl shadow-sm">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Send Us a Message
            </h2>

            <p className="text-gray-500 mb-6">
              Please fill in the form below to contact us.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full border border-gray-300 rounded-lg p-3 text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full border border-gray-300 rounded-lg p-3 text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter your phone number"
                  className="w-full border border-gray-300 rounded-lg p-3 text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Your Message
                </label>
                <textarea
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write your message here..."
                  className="w-full border border-gray-300 rounded-lg p-3 text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 rounded-lg transition"
              >
                Send Message
              </button>
            </form>

            <p className="text-xs text-gray-500 mt-4">
              The message will open in your email application for sending.
            </p>
          </div>

        </div>
      </section>
    </main>
  );
}
