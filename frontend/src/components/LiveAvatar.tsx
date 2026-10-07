import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  LiveAvatarSession,
  SessionEvent,
} from "@heygen/liveavatar-web-sdk";

type LiveAvatarProps = {
  sessionToken: string;
};

export default function LiveAvatar({
  sessionToken,
}: LiveAvatarProps) {

  const videoRef =
    useRef<HTMLVideoElement | null>(null);

  const sessionRef =
    useRef<LiveAvatarSession | null>(null);

  const [connected, setConnected] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {

    if (!sessionToken) {
      return;
    }

    let cancelled = false;

    async function startAvatar() {

      try {

        setError(null);

        const session =
          new LiveAvatarSession(
            sessionToken,
            {
              autoKeepAlive: true,

              voiceChat: {
                defaultMuted: true,
              },
            }
          );

        sessionRef.current = session;

        session.on(
          SessionEvent.SESSION_STREAM_READY,
          () => {

            if (cancelled) {
              return;
            }

            if (videoRef.current) {
              session.attach(
                videoRef.current
              );
            }

            setConnected(true);
          }
        );

        session.on(
          SessionEvent.SESSION_DISCONNECTED,
          () => {

            if (!cancelled) {
              setConnected(false);
            }

          }
        );

        await session.start();

      } catch (err) {

        console.error(
          "LiveAvatar error:",
          err
        );

        if (!cancelled) {

          setError(
            "Unable to connect to interviewer."
          );

        }

      }
    }

    startAvatar();

    return () => {

      cancelled = true;

      const session =
        sessionRef.current;

      if (session) {
        session.stop().catch(
          console.error
        );
      }

      sessionRef.current = null;

    };

  }, [sessionToken]);


  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
        borderRadius: "20px",
        background: "#111827",
      }}
    >

      <video
        ref={videoRef}
        autoPlay
        playsInline
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />

      <div
        style={{
          position: "absolute",
          top: 16,
          left: 16,
          padding: "8px 14px",
          borderRadius: "999px",
          background:
            "rgba(0,0,0,0.65)",
          color: "#fff",
          fontSize: "13px",
          fontWeight: 600,
        }}
      >
        {connected
          ? "● Interviewer Online"
          : "Connecting..."}
      </div>

      {error && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            background:
              "rgba(0,0,0,0.7)",
            padding: 20,
            textAlign: "center",
          }}
        >
          {error}
        </div>
      )}

    </div>
  );
}