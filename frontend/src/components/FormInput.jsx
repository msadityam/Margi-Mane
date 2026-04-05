export default function FormInput({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  options,
  textarea = false,
  className = "",
  ...rest
}) {
  return (
    <label className={`block ${className}`}>
      {label && <span className="mb-1 block text-sm font-medium text-gray-700">{label}</span>}
      {options ? (
        <select
          value={value}
          onChange={onChange}
          className="w-full rounded-lg border border-gray-300 p-2 text-sm text-gray-900"
          {...rest}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ) : textarea ? (
        <textarea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full rounded-lg border border-gray-300 p-2 text-sm text-gray-900 placeholder-gray-500"
          {...rest}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full rounded-lg border border-gray-300 p-2 text-sm text-gray-900 placeholder-gray-500"
          {...rest}
        />
      )}
    </label>
  );
}
