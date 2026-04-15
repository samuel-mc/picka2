type ErrorResponseData = {
  error?: string;
  message?: string;
};

export const getErrorMessage = (error: unknown, fallback: string) => {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof error.response === "object" &&
    error.response !== null &&
    "data" in error.response
  ) {
    const responseData = error.response.data;

    if (typeof responseData === "string" && responseData.trim()) {
      return responseData;
    }

    const typedResponseData = responseData as ErrorResponseData;

    if (typedResponseData.message?.trim()) {
      return typedResponseData.message;
    }

    if (typedResponseData.error?.trim()) {
      return typedResponseData.error;
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
};
