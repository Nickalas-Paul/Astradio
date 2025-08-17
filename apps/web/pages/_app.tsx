import { useEffect } from "react";
import type { AppProps } from "next/app";
import * as Sentry from "@sentry/nextjs";

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Global error boundary for frontend errors
    const handleError = (event: ErrorEvent) => {
      console.error("FE_ERROR", {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
      });
      
      // Capture in Sentry
      Sentry.captureException(event.error, {
        tags: {
          type: 'javascript_error',
          filename: event.filename
        },
        extra: {
          message: event.message,
          lineno: event.lineno,
          colno: event.colno
        }
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error("FE_UNHANDLED_REJECTION", {
        reason: event.reason,
        promise: event.promise
      });
      
      // Capture in Sentry
      Sentry.captureException(event.reason, {
        tags: {
          type: 'unhandled_rejection'
        },
        extra: {
          promise: event.promise
        }
      });
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, []);

  return <Component {...pageProps} />;
}
