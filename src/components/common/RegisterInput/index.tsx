import { useState } from "react";
import type { UseFormRegister, FieldError, Path, RegisterOptions } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";

interface RegisterInputProps<T extends Record<string, unknown>> {
  name: Path<T>;
  label?: string;
  register: UseFormRegister<T>;
  fieldError?: FieldError;
  required?: boolean;
  type?: string;
  validation?: RegisterOptions<T, Path<T>>;
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
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordType = type === "password";
  const inputType = isPasswordType ? (showPassword ? "text" : "password") : type;

  const inputStyles =
    "w-full bg-white placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow" +
    (isPasswordType ? " pr-10" : "");

  return (
    <div className="mb-5">
      {label && <label className="block mb-1">{label}</label>}
      <div className="relative">
        {type === "textarea" ? (
          <textarea
            className={`${inputStyles} resize-y min-h-[100px]`}
            {...register(name, { required, ...validation })}
          />
        ) : (
          <input
            className={inputStyles}
            {...register(name, { required, ...validation })}
            type={inputType}
          />
        )}
        {isPasswordType && (
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none flex items-center justify-center"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
      {fieldError && (
        <span className="text-red-500 text-sm mt-1 block">
          {fieldError.message || "Este campo es requerido"}
        </span>
      )}
    </div>
  );
};
