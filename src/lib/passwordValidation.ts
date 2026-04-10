import type { FieldValues, Path, RegisterOptions } from "react-hook-form";

export const buildPasswordValidation = <
  T extends FieldValues,
>(): RegisterOptions<T, Path<T>> => ({
  minLength: {
    value: 8,
    message: "Debe tener al menos 8 caracteres",
  },
  pattern: {
    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
    message: "Debe incluir mayúsculas, minúsculas y números",
  },
});
