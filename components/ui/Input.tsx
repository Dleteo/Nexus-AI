type InputProps = {
  label: string;
  type: string;
  placeholder: string;
};

export default function Input({ label, type, placeholder }: InputProps) {
  return (
    <div>
      <label className="mb-2 block text-sm text-gray-300">{label}</label>

      <input
        type={type}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none transition placeholder:text-gray-600 focus:border-cyan-400"
      />
    </div>
  );
}