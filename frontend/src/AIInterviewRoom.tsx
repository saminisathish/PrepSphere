import React, { useEffect, useRef, useState } from "react";

const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

interface AIInterviewRoomProps {
  interviewType: "technical" | "hr" | "communication";
}

interface SpeechRecognitionEventLike {
  results: {
    length: number;
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
}

interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: unknown) => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

interface WindowWithSpeechRecognition extends Window {
  SpeechRecognition?: new () => SpeechRecognitionLike;
  webkitSpeechRecognition?: new () => SpeechRecognitionLike;
}

export default function AIInterviewRoom({
  interviewType,
}: AIInterviewRoomProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  const [cameraStarted, setCameraStarted] = useState(false);
  const [micListening, setMicListening] = useState(false);

  const [status, setStatus] = useState<
    "ready" | "starting" | "speaking" | "listening" | "evaluating" | "finished"
  >("ready");

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const [interviewId, setInterviewId] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);

  const [started, setStarted] = useState(false);

  const [isSpeaking, setIsSpeaking] = useState(false);

  const interviewName =
    interviewType === "technical"
      ? "Technical Interview"
      : interviewType === "hr"
      ? "HR Interview"
      : "Communication Interview";

  // ---------------------------------------------------------
  // START CAMERA + MICROPHONE
  // ---------------------------------------------------------

  const startCamera = async () => {
    try {
      setError(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: 1280,
          height: 720,
          facingMode: "user",
        },
        audio: true,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setCameraStarted(true);
    } catch (err) {
      console.error("Camera/microphone error:", err);

      setError(
        "Camera or microphone permission was denied. Please allow camera and microphone access."
      );
    }
  };

  // ---------------------------------------------------------
  // SPEAK AI QUESTION
  // ---------------------------------------------------------

  const speakQuestion = (text: string) => {
    if (!text) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    utterance.lang = "en-IN";
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    const voices = window.speechSynthesis.getVoices();

    const indianVoice =
      voices.find((voice) =>
        voice.lang.toLowerCase().includes("en-in")
      ) ||
      voices.find((voice) =>
        voice.lang.toLowerCase().startsWith("en")
      );

    if (indianVoice) {
      utterance.voice = indianVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      setStatus("speaking");
    };

    utterance.onend = () => {
      setIsSpeaking(false);

      // Automatically start listening after AI finishes speaking
      setTimeout(() => {
        startListening();
      }, 500);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setStatus("ready");
    };

    window.speechSynthesis.speak(utterance);
  };

  // ---------------------------------------------------------
  // SPEECH RECOGNITION
  // ---------------------------------------------------------

  const startListening = () => {
    const speechWindow =
      window as WindowWithSpeechRecognition;

    const SpeechRecognition =
      speechWindow.SpeechRecognition ||
      speechWindow.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError(
        "Speech recognition is not supported in this browser. Please use Google Chrome."
      );
      return;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // ignore
      }
    }

    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-IN";

    let finalTranscript = "";

    recognition.onstart = () => {
      setMicListening(true);
      setStatus("listening");
      setAnswer("");
    };

    recognition.onresult = (event) => {
      let transcript = "";

      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }

      finalTranscript = transcript;

      setAnswer(transcript);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event);

      setMicListening(false);

      // Do not immediately show an error for common recognition interruptions.
      setStatus("ready");
    };

    recognition.onend = () => {
      setMicListening(false);

      if (finalTranscript.trim()) {
        submitAnswer(finalTranscript.trim());
      }
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (err) {
      console.error("Could not start speech recognition:", err);
    }
  };

  // ---------------------------------------------------------
  // START INTERVIEW
  // ---------------------------------------------------------

  const startInterview = async () => {
    try {
      setError(null);
      setStatus("starting");

      if (!cameraStarted) {
        await startCamera();
      }

      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("access_token") ||
        localStorage.getItem("auth_token");

      if (!token) {
        throw new Error(
          "Login session not found. Please login again."
        );
      }

      const response = await fetch(
        `${API_URL}/api/interview/start`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            interview_type: interviewType,
          }),
        }
      );

      const rawText = await response.text();

      if (!response.ok) {
        console.error("Start interview error:", rawText);

        throw new Error(
          `Unable to start interview (${response.status}).`
        );
      }

      const data = JSON.parse(rawText);

      console.log("Interview started:", data);

      const id =
        data.interview_id ||
        data.id ||
        data.session_id;

      const firstQuestion =
        data.question ||
        data.first_question ||
        data.ai_question;

      if (!id) {
        throw new Error(
          "Backend did not return an interview ID."
        );
      }

      if (!firstQuestion) {
        throw new Error(
          "Backend did not return the first interview question."
        );
      }

      setInterviewId(id);
      setQuestion(firstQuestion);
      setStarted(true);

      // Give the avatar a moment to appear
      setTimeout(() => {
        speakQuestion(firstQuestion);
      }, 700);
    } catch (err) {
      console.error("START INTERVIEW ERROR:", err);

      setStatus("ready");

      setError(
        err instanceof Error
          ? err.message
          : "Unable to start interview."
      );
    }
  };

  // ---------------------------------------------------------
  // SUBMIT STUDENT ANSWER
  // ---------------------------------------------------------

  const submitAnswer = async (studentAnswer: string) => {
    if (!interviewId || !studentAnswer.trim()) {
      return;
    }

    try {
      setStatus("evaluating");
      setAnswer(studentAnswer);

      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("access_token") ||
        localStorage.getItem("auth_token");

      if (!token) {
        throw new Error("Login session expired.");
      }

      const response = await fetch(
        `${API_URL}/api/interview/${interviewId}/answer`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            answer: studentAnswer,
          }),
        }
      );

      const rawText = await response.text();

      if (!response.ok) {
        console.error("Answer API error:", rawText);

        throw new Error(
          `Unable to submit answer (${response.status}).`
        );
      }

      const data = JSON.parse(rawText);

      console.log("Answer evaluation:", data);

      const nextQuestion =
        data.next_question ||
        data.question ||
        data.ai_question;

      const completed =
        data.completed === true ||
        data.finished === true ||
        !nextQuestion;

      if (completed) {
        window.speechSynthesis.cancel();

        setStatus("finished");
        setQuestion(
          data.message ||
            "Your interview is complete. Thank you for participating."
        );

        if (data.feedback) {
          console.log("Final feedback:", data.feedback);
        }

        speakQuestion(
          data.message ||
            "Your interview is complete. Thank you for participating."
        );

        return;
      }

      setQuestion(nextQuestion);
      setAnswer("");

      setTimeout(() => {
        speakQuestion(nextQuestion);
      }, 500);
    } catch (err) {
      console.error("SUBMIT ANSWER ERROR:", err);

      setStatus("ready");

      setError(
        err instanceof Error
          ? err.message
          : "Unable to submit your answer."
      );
    }
  };

  // ---------------------------------------------------------
  // STOP INTERVIEW
  // ---------------------------------------------------------

  const stopInterview = () => {
    window.speechSynthesis.cancel();

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });

      streamRef.current = null;
    }

    setCameraStarted(false);
    setMicListening(false);
    setIsSpeaking(false);
    setStarted(false);
    setStatus("ready");
  };

  // ---------------------------------------------------------
  // CLEANUP
  // ---------------------------------------------------------

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();

      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => {
          track.stop();
        });
      }
    };
  }, []);

  // ---------------------------------------------------------
  // UI
  // ---------------------------------------------------------

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-white">

      {/* HEADER */}

      <div className="mx-auto mb-6 max-w-7xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              PrepSphere AI Interview
            </h1>

            <p className="mt-1 text-slate-400">
              {interviewName}
            </p>
          </div>

          <div
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              status === "speaking"
                ? "bg-blue-500/20 text-blue-300"
                : status === "listening"
                ? "bg-green-500/20 text-green-300"
                : status === "evaluating"
                ? "bg-yellow-500/20 text-yellow-300"
                : status === "finished"
                ? "bg-purple-500/20 text-purple-300"
                : "bg-slate-700 text-slate-300"
            }`}
          >
            {status === "speaking" && "🔊 AI Speaking"}
            {status === "listening" && "🎤 Listening"}
            {status === "evaluating" && "🧠 Evaluating"}
            {status === "finished" && "✓ Interview Complete"}
            {(status === "ready" ||
              status === "starting") &&
              "Ready"}
          </div>
        </div>
      </div>

      {/* ERROR */}

      {error && (
        <div className="mx-auto mb-5 max-w-7xl rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* MAIN INTERVIEW */}

      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-2">

        {/* AI AVATAR */}

        <div className="overflow-hidden rounded-2xl border border-slate-700 bg-black shadow-2xl">

          <div className="border-b border-slate-700 bg-slate-900 px-5 py-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold">
                AI Interviewer
              </span>

              {isSpeaking && (
                <span className="flex items-center gap-2 text-sm text-blue-400">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-blue-400" />
                  Speaking
                </span>
              )}
            </div>
          </div>

          <div className="relative aspect-video bg-black">

            <video
              className="h-full w-full object-cover"
              src="/interviewer.mp4"
              autoPlay
              loop
              muted
              playsInline
            />

            {isSpeaking && (
              <div className="absolute bottom-4 left-4 rounded-full bg-black/70 px-4 py-2 text-sm">
                🔊 AI Interviewer is speaking...
              </div>
            )}
          </div>
        </div>

        {/* STUDENT CAMERA */}

        <div className="overflow-hidden rounded-2xl border border-slate-700 bg-black shadow-2xl">

          <div className="border-b border-slate-700 bg-slate-900 px-5 py-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold">
                Your Camera
              </span>

              <span
                className={`text-sm ${
                  cameraStarted
                    ? "text-green-400"
                    : "text-slate-500"
                }`}
              >
                {cameraStarted
                  ? "● Camera ON"
                  : "Camera OFF"}
              </span>
            </div>
          </div>

          <div className="relative aspect-video bg-slate-900">

            {cameraStarted ? (
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-slate-500">
                <div className="text-center">
                  <div className="mb-3 text-5xl">
                    📷
                  </div>

                  <p>
                    Camera preview will appear here
                  </p>
                </div>
              </div>
            )}

            {micListening && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-green-600 px-5 py-2 text-sm font-semibold shadow-lg">
                🎤 Listening...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* QUESTION */}

      <div className="mx-auto mt-6 max-w-7xl rounded-2xl border border-slate-700 bg-slate-900 p-6">

        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-blue-400">
          <span>🤖</span>
          Current Question
        </div>

        <p className="text-xl leading-relaxed text-white">
          {question ||
            "Click Start Interview to begin."}
        </p>
      </div>

      {/* ANSWER */}

      {answer && (
        <div className="mx-auto mt-4 max-w-7xl rounded-2xl border border-green-500/20 bg-green-500/5 p-6">

          <div className="mb-3 text-sm font-semibold text-green-400">
            🎤 Your Answer
          </div>

          <p className="leading-relaxed text-slate-200">
            {answer}
          </p>
        </div>
      )}

      {/* CONTROLS */}

      <div className="mx-auto mt-6 flex max-w-7xl justify-center gap-4">

        {!started ? (
          <button
            onClick={startInterview}
            disabled={status === "starting"}
            className="rounded-xl bg-blue-600 px-8 py-4 font-bold shadow-lg transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {status === "starting"
              ? "Starting Interview..."
              : "🎙 Start Interview"}
          </button>
        ) : (
          <button
            onClick={stopInterview}
            className="rounded-xl bg-red-600 px-8 py-4 font-bold shadow-lg transition hover:bg-red-500"
          >
            End Interview
          </button>
        )}
      </div>

      {/* INSTRUCTIONS */}

      <div className="mx-auto mt-6 max-w-7xl rounded-xl border border-slate-800 bg-slate-900/60 p-5">

        <h3 className="font-semibold">
          Interview Instructions
        </h3>

        <div className="mt-3 grid gap-2 text-sm text-slate-400 md:grid-cols-2">
          <p>• Allow camera and microphone access.</p>
          <p>• Look at the AI interviewer.</p>
          <p>• Listen carefully to each question.</p>
          <p>• Speak naturally and clearly.</p>
          <p>• Take a moment before answering.</p>
          <p>• Your answers are evaluated by AI.</p>
        </div>
      </div>
    </div>
  );
}