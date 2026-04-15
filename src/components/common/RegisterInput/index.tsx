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
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  validation?: RegisterOptions<T, Path<T>>;
  helperText?: string;
  helperTone?: "default" | "success";
}

export const RegisterInput = <T extends Record<string, unknown>>({
  name,
  label,
  register,
  fieldError,
  type = "text",
  required = false,
  autoComplete,
  inputMode,
  validation,
  helperText,
  helperTone = "default",
}: RegisterInputProps<T>) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordType = type === "password";
  const inputType = isPasswordType ? (showPassword ? "text" : "password") : type;
  const inputId = String(name);
  const resolvedAutoComplete =
    autoComplete ??
    (name === "username"
      ? "username"
      : name === "password"
        ? "current-password"
        : name === "passwordConfirm"
          ? "new-password"
          : undefined);
  const resolvedInputMode =
    inputMode ?? (name === "username" ? "email" : undefined);

  const inputStyles =
    "w-full bg-white placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow" +
    (isPasswordType ? " pr-10" : "");

  return (
    <div className="mb-5">
      {label && (
        <label className="block mb-1" htmlFor={inputId}>
          {label}
        </label>
      )}
      <div className="relative">
        {type === "textarea" ? (
          <textarea
            id={inputId}
            className={`${inputStyles} resize-y min-h-[100px]`}
            autoComplete={resolvedAutoComplete}
            {...register(name, { required, ...validation })}
          />
        ) : (
          <input
            id={inputId}
            className={inputStyles}
            type={inputType}
            autoComplete={resolvedAutoComplete}
            inputMode={resolvedInputMode}
            autoCapitalize={name === "username" ? "none" : undefined}
            autoCorrect={name === "username" ? "off" : undefined}
            spellCheck={name === "username" ? false : undefined}
            {...register(name, { required, ...validation })}
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
      {fieldError ? (
        <span className="text-red-500 text-sm mt-1 block">
          {fieldError.message || "Este campo es requerido"}
        </span>
      ) : helperText ? (
        <span
          className={`text-sm mt-1 block ${
            helperTone === "success" ? "text-emerald-600" : "text-slate-500"
          }`}
        >
          {helperText}
        </span>
      ) : null}
    </div>
  );
};
