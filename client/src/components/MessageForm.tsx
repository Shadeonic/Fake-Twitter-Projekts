import React from "react";
import { useState, useEffect } from "react";

export default function MessageForm({ onMessagePosted }: { onMessagePosted?: () => void }) {
  const [formData, setFormData] = useState({ title: "", body: "" });//sākuma dati, saglbā ievadītos

  //parāda visu reālajā laikā
  useEffect(() => {
    console.log("Raksta:", formData);
  }, [formData]);

  //Uz katru ievades burtu, atjaunina ievadīto tekstu 
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  //Submit poga
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // Send to backend
  await fetch("http://localhost:4000/api/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });

  // Clear form
  setFormData({ title: "", body: "" });

  // Tell parent to refresh messages
  if (typeof onMessagePosted === "function") {
    onMessagePosted();
  }
};


  return (
    <section className="border-[#999999] border mx-auto mt-4 text-white">
      <form onSubmit={handleSubmit} className="flex flex-col p-4 gap-4">
        {/* Title */}
        <div className="relative border border-[#999999] p-2">
          <label htmlFor="Title" className="absolute -top-3 left-2 bg-black px-1 text-lg font-bold">Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full border-none outline-none bg-black p-2"
            required
          />
        </div>
        {/* Message */}
        <div className="relative border border-[#999999] p-2">
          <label htmlFor="Message" className="absolute -top-3 left-2 bg-black px-1 text-lg font-bold">Message</label>
          <textarea
            name="body"
            value={formData.body}
            onChange={handleChange}
            className="w-full p-2 border-none outline-none bg-black max-h-[100px]"
            required
          />
        </div>
        {/* Button */}
        <button type="submit" className="cursor-pointer border border-[#bb7eca] text-[#bb7eca] hover:underline hover:bg-[#bb7eca]/20 active:bg-[#22c55e]/20 font-bold py-2 px-4 mt-4 active:text-[#22c55e] active:border-[#22c55e]">
          Submit
        </button>
      </form>
    </section>
  );
}
