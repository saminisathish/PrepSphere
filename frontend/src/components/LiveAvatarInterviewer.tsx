import {
  useEffect,
  useRef,
  useState,
} from "react";

import * as did from "@d-id/client-sdk";

interface LiveAvatarInterviewerProps {
  question: string;
  className?: string;
}

type AvatarStatus =
  | "connecting"
  | "connected"
  | "speaking"
  | "idle"
  | "error";

export default function LiveAvatarInterviewer({
  question,
  className = "",
}: LiveAvatarInterviewerProps) {
  const videoRef =
    useRef<HTMLVideoElement | null>(null);

  const agentRef =
    useRef<Awaited<
      ReturnType<
        typeof did.createAgentManager
      >
    > | null>(null);

  const lastSpokenQuestionRef =
    useRef("");

  const mountedRef =
    useRef(true);

  const [status, setStatus] =
    useState<AvatarStatus>("connecting");

  const [error, setError] =
    useState("");

  /* =====================================================
     D-ID CONNECTION
  ===================================================== */

  useEffect(() => {
    mountedRef.current = true;

    /*
     * Agent ID:
     * First try Vite environment variable.
     * If it is not loaded, use your actual Agent ID
     * as a fallback.
     */
    const agentId =
      import.meta.env.VITE_DID_AGENT_ID ||
      "v2_agt_glPmy8bU";

    /*
     * Client key MUST come from .env.
     * Never hard-code your client key in this file.
     */
    const clientKey =
      import.meta.env.VITE_DID_CLIENT_KEY;

    const videoElement =
      videoRef.current;

    console.log(
      "D-ID Agent ID loaded:",
      agentId
    );

    console.log(
      "D-ID Client Key loaded:",
      clientKey
        ? "YES"
        : "NO"
    );

    /* -----------------------------------------------
       CHECK CLIENT KEY
    ----------------------------------------------- */

    if (!clientKey) {
      setStatus("error");

      setError(
        "D-ID Client Key is missing. Check frontend/.env and restart Vite."
      );

      return;
    }

    let cancelled = false;

    /* -----------------------------------------------
       CONNECT
    ----------------------------------------------- */

    async function connectAvatar() {
      try {
        console.log(
          "Connecting to D-ID..."
        );

        setStatus("connecting");
        setError("");

        const agent =
          await did.createAgentManager(
            agentId,
            {
              auth: {
                type: "key",
                clientKey,
              },

              callbacks: {
                /* -------------------------------------
                   STREAM READY
                ------------------------------------- */

                onSrcObjectReady(
                  stream: MediaStream
                ) {
                  console.log(
                    "D-ID MediaStream received"
                  );

                  if (
                    cancelled ||
                    !mountedRef.current ||
                    !videoElement
                  ) {
                    return;
                  }

                  videoElement.srcObject =
                    stream;

                  videoElement.autoplay =
                    true;

                  videoElement.playsInline =
                    true;

                  videoElement.muted =
                    false;

                  void videoElement
                    .play()
                    .then(() => {
                      console.log(
                        "D-ID video started"
                      );
                    })
                    .catch((err) => {
                      console.warn(
                        "Video autoplay warning:",
                        err
                      );
                    });
                },

                /* -------------------------------------
                   CONNECTION STATE
                ------------------------------------- */

                onConnectionStateChange(
                  state: string
                ) {
                  console.log(
                    "D-ID connection:",
                    state
                  );

                  if (
                    state === "connected"
                  ) {
                    setStatus(
                      "connected"
                    );
                  }

                  if (
                    state ===
                      "disconnected" ||
                    state === "closed"
                  ) {
                    setStatus("idle");
                  }

                  if (
                    state === "fail"
                  ) {
                    setStatus("error");

                    setError(
                      "D-ID connection failed."
                    );
                  }
                },

                /* -------------------------------------
                   VIDEO STATE
                ------------------------------------- */

                onVideoStateChange(
                  state: string
                ) {
                  console.log(
                    "D-ID video state:",
                    state
                  );

                  if (
                    state === "START"
                  ) {
                    setStatus(
                      "speaking"
                    );
                  }

                  if (
                    state === "STOP"
                  ) {
                    setStatus("idle");
                  }
                },

                /* -------------------------------------
                   ERROR
                ------------------------------------- */

                onError(
                  err: unknown,
                  data: unknown
                ) {
                  console.error(
                    "D-ID SDK error:",
                    err,
                    data
                  );

                  setStatus("error");

                  if (
                    err instanceof Error
                  ) {
                    setError(
                      err.message
                    );
                  } else {
                    setError(
                      "D-ID avatar encountered an error."
                    );
                  }
                },
              },

              streamOptions: {
                compatibilityMode:
                  "auto",

                streamWarmup: true,
              },
            }
          );

        if (cancelled) {
          await agent.disconnect();
          return;
        }

        agentRef.current =
          agent;

        console.log(
          "Calling D-ID connect()..."
        );

        await agent.connect();

        console.log(
          "D-ID connected successfully"
        );
      } catch (err) {
        console.error(
          "D-ID connection error:",
          err
        );

        if (
          !cancelled &&
          mountedRef.current
        ) {
          setStatus("error");

          setError(
            err instanceof Error
              ? err.message
              : "Unable to connect to D-ID."
          );
        }
      }
    }

    void connectAvatar();

    /* -----------------------------------------------
       CLEANUP
    ----------------------------------------------- */

    return () => {
      cancelled = true;
      mountedRef.current = false;

      const currentAgent =
        agentRef.current;

      agentRef.current = null;

      if (currentAgent) {
        void currentAgent
          .disconnect()
          .catch((err) => {
            console.warn(
              "D-ID disconnect error:",
              err
            );
          });
      }

      if (videoElement) {
        videoElement.pause();
        videoElement.srcObject =
          null;
      }
    };
  }, []);

  /* =====================================================
     SPEAK QUESTION
  ===================================================== */

  useEffect(() => {
    const cleanQuestion =
      question.trim();

    const currentAgent =
      agentRef.current;

    if (!currentAgent) {
      return;
    }

    if (!cleanQuestion) {
      return;
    }

    /*
     * Don't repeat the same question.
     */
    if (
      lastSpokenQuestionRef.current ===
      cleanQuestion
    ) {
      return;
    }

    /*
     * Wait until D-ID is ready.
     */
    if (
      status !== "connected" &&
      status !== "idle"
    ) {
      return;
    }

    lastSpokenQuestionRef.current =
      cleanQuestion;

    const speakAgent =
      currentAgent;

    async function speakQuestion() {
      try {
        console.log(
          "D-ID speaking:",
          cleanQuestion
        );

        setStatus("speaking");

        await speakAgent.speak({
          type: "text",
          input: cleanQuestion,
        });

        console.log(
          "D-ID speech request sent"
        );
      } catch (err) {
        console.error(
          "D-ID speak error:",
          err
        );

        lastSpokenQuestionRef.current =
          "";

        if (
          mountedRef.current
        ) {
          setStatus("error");

          setError(
            err instanceof Error
              ? err.message
              : "Avatar could not speak."
          );
        }
      }
    }

    void speakQuestion();
  }, [question, status]);

  /* =====================================================
     UI
  ===================================================== */

  return (
    <div
      className={`relative overflow-hidden bg-black ${className}`}
    >
      {/* VIDEO */}

      <video
        ref={videoRef}
        autoPlay
        playsInline
        controls={false}
        className="h-full w-full object-cover"
      />

      {/* STATUS */}

      <div className="absolute left-4 top-4">
        <div
          className={`rounded-full px-4 py-2 text-xs font-semibold ${
            status === "connected"
              ? "bg-green-500 text-white"
              : status === "speaking"
                ? "bg-violet-600 text-white"
                : status ===
                    "connecting"
                  ? "bg-yellow-500 text-white"
                  : status ===
                      "error"
                    ? "bg-red-500 text-white"
                    : "bg-slate-700 text-white"
          }`}
        >
          {status ===
            "connecting" &&
            "Connecting avatar..."}

          {status === "connected" &&
            "Avatar ready"}

          {status === "speaking" &&
            "AI Interviewer speaking..."}

          {status === "idle" &&
            "Waiting for question"}

          {status === "error" &&
            "Avatar error"}
        </div>
      </div>

      {/* ERROR */}

      {error && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="rounded-2xl bg-red-950/95 p-5 text-white">
            <p className="font-semibold">
              D-ID Avatar Error
            </p>

            <p className="mt-2 text-sm text-red-200">
              {error}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}