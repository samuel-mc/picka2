import type { UseFormRegister, FieldError, Path, RegisterOptions } from "react-hook-form";

interface RegisterInputProps<T extends Record<string, unknown>> {
  name: Path<T>; // <-- aquí
  label?: string;
  register: UseFormRegister<T>;
  fieldError?: FieldError;
  required?: boolean;
  type?: string;
  validation?: RegisterOptions<T, Path<T>>; // <-- aquí
}
export const RegisterInput = <T extends Record<string, unknown>>({
  name,
  label,
  register,
  fieldError,
  type = "text",
  required = false,
  validation,
}: RegisterInputProps<T>) => {
  const inputStyles =
    "w-full bg-white placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow";

  return (
    <div className="mb-5">
      {label && <label className="block mb-1">{label}</label>}
      <input
        className={inputStyles}
        {...register(name, { required, ...validation })}
        type={type}
      />
      {fieldError && (
        <span className="text-red-500 text-sm">
          {fieldError.message || "Este campo es requerido"}
        </span>
      )}
    </div>
  );
};
