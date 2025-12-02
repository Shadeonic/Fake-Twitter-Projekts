import { useState } from 'react';
import { useMessagesStore } from '../stores/messagesStore';

export default function MessageForm() {
  const [formData, setFormData] = useState({ title: '', body: '' });
  const { postMessage, cooldown } = useMessagesStore();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cooldown > 0) return;
    const result = await postMessage(formData.title, formData.body);
    if (result.ok) setFormData({ title: '', body: '' });
    else alert(result.error);
  };

  return (
    <section className="border-[#999999] border mx-auto mt-4 text-white">
      <form onSubmit={handleSubmit} className="flex flex-col p-4 gap-3">
        <div className="relative border border-[#999999] p-2">
          <label className="absolute -top-3 left-2 bg-black px-1 text-sm font-bold">Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full border-none outline-none bg-black p-2"
            required
          />
        </div>
        <div className="relative border border-[#999999] p-2">
          <label className="absolute -top-3 left-2 bg-black px-1 text-sm font-bold">Message</label>
          <textarea
            name="body"
            value={formData.body}
            onChange={handleChange}
            className="w-full p-2 border-none outline-none bg-black max-h-[100px]"
            required
          />
        </div>
        <button
          type="submit"
          disabled={cooldown > 0}
          className="cursor-pointer border border-[#bb7eca] text-[#bb7eca] hover:underline hover:bg-[#bb7eca]/20 font-bold py-2 px-4 mt-4"
        >
          {cooldown > 0 ? String(cooldown).padStart(2, '0') : 'Submit'}
        </button>
      </form>
    </section>
  );
}
