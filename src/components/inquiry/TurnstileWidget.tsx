"use client";

import Script from "next/script";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

type TurnstileOptions = {
  sitekey: string;
  execution: "execute";
  appearance: "interaction-only";
  size: "compact";
  theme: "auto";
  action: string;
  callback: (token: string) => void;
  "error-callback": () => void;
  "expired-callback": () => void;
  "timeout-callback": () => void;
  "unsupported-callback": () => void;
};

type TurnstileApi = {
  render: (container: HTMLElement, options: TurnstileOptions) => string;
  execute: (widgetId: string) => void;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

export type TurnstileWidgetHandle = {
  execute: () => Promise<string>;
  reset: () => void;
  retry: () => void;
};

type TurnstileWidgetProps = {
  onReadyChange?: (ready: boolean) => void;
  onErrorChange?: (message?: string) => void;
};

const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
const EXECUTION_TIMEOUT_MS = 20_000;

export const TurnstileWidget = forwardRef<TurnstileWidgetHandle, TurnstileWidgetProps>(
  function TurnstileWidget({ onReadyChange, onErrorChange }, ref) {
    const [scriptAttempt, setScriptAttempt] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);
    const pendingRef = useRef<{
      resolve: (token: string) => void;
      reject: (error: Error) => void;
      timeoutId: number;
    } | null>(null);

    const rejectPending = useCallback((message: string) => {
      if (pendingRef.current) window.clearTimeout(pendingRef.current.timeoutId);
      pendingRef.current?.reject(new Error(message));
      pendingRef.current = null;
    }, []);

    const renderWidget = useCallback(() => {
      if (!siteKey || !containerRef.current || !window.turnstile || widgetIdRef.current) return;

      try {
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          execution: "execute",
          appearance: "interaction-only",
          size: "compact",
          theme: "auto",
          action: "project_inquiry",
          callback(token) {
            if (pendingRef.current) window.clearTimeout(pendingRef.current.timeoutId);
            pendingRef.current?.resolve(token);
            pendingRef.current = null;
          },
          "error-callback"() {
            rejectPending("Die Sicherheitsprüfung konnte nicht abgeschlossen werden.");
          },
          "expired-callback"() {
            rejectPending("Die Sicherheitsprüfung ist abgelaufen. Bitte versuchen Sie es erneut.");
          },
          "timeout-callback"() {
            rejectPending("Die Sicherheitsprüfung hat zu lange gedauert. Bitte versuchen Sie es erneut.");
          },
          "unsupported-callback"() {
            rejectPending("Die Sicherheitsprüfung wird von diesem Browser nicht unterstützt.");
          },
        });
        onErrorChange?.(undefined);
        onReadyChange?.(true);
      } catch {
        widgetIdRef.current = null;
        onReadyChange?.(false);
        onErrorChange?.("Die Sicherheitsprüfung konnte nicht geladen werden.");
      }
    }, [onErrorChange, onReadyChange, rejectPending]);

    useImperativeHandle(
      ref,
      () => ({
        execute() {
          if (!siteKey) {
            return Promise.reject(
              new Error("Die Sicherheitsprüfung ist in dieser Umgebung noch nicht konfiguriert."),
            );
          }

          renderWidget();
          const widgetId = widgetIdRef.current;
          if (!widgetId || !window.turnstile) {
            return Promise.reject(
              new Error("Die Sicherheitsprüfung wird noch geladen. Bitte versuchen Sie es erneut."),
            );
          }

          if (pendingRef.current) {
            return Promise.reject(new Error("Die Sicherheitsprüfung läuft bereits."));
          }

          return new Promise<string>((resolve, reject) => {
            const timeoutId = window.setTimeout(() => {
              rejectPending("Die Sicherheitsprüfung hat zu lange gedauert. Bitte versuchen Sie es erneut.");
            }, EXECUTION_TIMEOUT_MS);
            pendingRef.current = { resolve, reject, timeoutId };
            window.turnstile?.execute(widgetId);
          });
        },
        reset() {
          const widgetId = widgetIdRef.current;
          if (widgetId && window.turnstile) window.turnstile.reset(widgetId);
          if (pendingRef.current) window.clearTimeout(pendingRef.current.timeoutId);
          pendingRef.current = null;
        },
        retry() {
          const widgetId = widgetIdRef.current;
          if (widgetId && window.turnstile) window.turnstile.remove(widgetId);
          widgetIdRef.current = null;
          onReadyChange?.(false);
          onErrorChange?.(undefined);
          if (window.turnstile) {
            window.setTimeout(renderWidget, 0);
          } else {
            setScriptAttempt((current) => current + 1);
          }
        },
      }),
      [onErrorChange, onReadyChange, rejectPending, renderWidget],
    );

    useEffect(() => {
      if (!siteKey) {
        onReadyChange?.(false);
        onErrorChange?.("Die Sicherheitsprüfung ist in dieser Umgebung nicht konfiguriert.");
      }
      renderWidget();
      return () => {
        const widgetId = widgetIdRef.current;
        if (widgetId && window.turnstile) window.turnstile.remove(widgetId);
        widgetIdRef.current = null;
        rejectPending("Die Sicherheitsprüfung wurde beendet.");
        onReadyChange?.(false);
      };
    }, [onErrorChange, onReadyChange, rejectPending, renderWidget]);

    return (
      <>
        {siteKey && (
          <Script
            key={scriptAttempt}
            src={`https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&retry=${scriptAttempt}`}
            strategy="afterInteractive"
            onLoad={() => {
              onErrorChange?.(undefined);
              renderWidget();
            }}
            onError={() => {
              onReadyChange?.(false);
              onErrorChange?.("Die Sicherheitsprüfung konnte nicht geladen werden.");
            }}
          />
        )}
        <div ref={containerRef} className="min-h-0 max-w-full overflow-hidden" />
      </>
    );
  },
);
