import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

interface TavusInterviewerProps {
  interviewType:
    | "technical"
    | "hr"
    | "communication";
}

interface SpeechRecognitionResultItem {
  transcript: string;
}

interface SpeechRecognitionResultLike {
  0: SpeechRecognitionResultItem;
  isFinal?: boolean;
}

interface SpeechRecognitionResultsLike {
  length: number;
  [index: number]: SpeechRecognitionResultLike;
}

interface SpeechRecognitionEventLike {
  results: SpeechRecognitionResultsLike;
}

interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: unknown) => void) | null;
  onresult:
    | ((event: SpeechRecognitionEventLike) => void)
    | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

interface SpeechRecognitionWindow extends Window {
  SpeechRecognition?: new () => SpeechRecognitionLike;
  webkitSpeechRecognition?: new () => SpeechRecognitionLike;
}

interface StartInterviewResponse {
  interview_id?: string;
  id?: string;
  session_id?: string;
  first_question?: string;
  question?: string;
  ai_question?: string;
  message?: string;
  detail?: string;
}

interface AnswerResponse {
  next_question?: string;
  question?: string;
  ai_question?: string;
  completed?: boolean;
  finished?: boolean;
  feedback?: unknown;
  final_feedback?: unknown;
  message?: string;
  detail?: string;
}

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000";

export default function TavusInterviewer({
  interviewType,
}: TavusInterviewerProps) {
  // ==========================================================
  // REFS
  // ==========================================================

  const studentVideoRef =
    useRef<HTMLVideoElement | null>(null);

  const avatarVideoRef =
    useRef<HTMLVideoElement | null>(null);

  const streamRef =
    useRef<MediaStream | null>(null);

  const recognitionRef =
    useRef<SpeechRecognitionLike | null>(null);

  const speechTimeoutRef =
    useRef<number | null>(null);

  const isSubmittingRef =
    useRef(false);

  // ==========================================================
  // STATE
  // ==========================================================

  const [interviewId, setInterviewId] =
    useState<string | null>(null);

  const [question, setQuestion] = useState(
    "Click Start Interview to begin your AI interview."
  );

  const [answer, setAnswer] = useState("");

  const [isStarted, setIsStarted] =
    useState(false);

  const [cameraOn, setCameraOn] =
    useState(false);

  const [microphoneOn, setMicrophoneOn] =
    useState(false);

  const [isListening, setIsListening] =
    useState(false);

  const [isSpeaking, setIsSpeaking] =
    useState(false);

  const [isLoading, setIsLoading] =
    useState(false);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [completed, setCompleted] =
    useState(false);

  const [error, setError] =
    useState("");

  const [status, setStatus] =
    useState("Ready to Start");

  // ==========================================================
  // TOKEN
  // ==========================================================

  const getToken = () => {
    return (
      localStorage.getItem("token") ||
      localStorage.getItem("access_token") ||
      localStorage.getItem("auth_token") ||
      ""
    );
  };

  // ==========================================================
  // STOP MEDIA
  // ==========================================================

  const stopMedia = useCallback(() => {
    if (streamRef.current) {
      streamRef.current
        .getTracks()
        .forEach((track) => track.stop());

      streamRef.current = null;
    }

    if (studentVideoRef.current) {
      studentVideoRef.current.srcObject = null;
    }

    setCameraOn(false);
    setMicrophoneOn(false);
  }, []);

  // ==========================================================
  // START CAMERA + MICROPHONE
  // ==========================================================

  const startCameraAndMicrophone =
    useCallback(async (): Promise<boolean> => {
      try {
        setError("");

        setStatus(
          "Requesting camera and microphone..."
        );

        if (!navigator.mediaDevices) {
          throw new Error(
            "Camera access is not supported by this browser."
          );
        }

        if (streamRef.current) {
          streamRef.current
            .getTracks()
            .forEach((track) => track.stop());

          streamRef.current = null;
        }

        const stream =
          await navigator.mediaDevices.getUserMedia({
            video: {
              width: {
                ideal: 1280,
              },
              height: {
                ideal: 720,
              },
              facingMode: "user",
            },
            audio: true,
          });

        streamRef.current = stream;

        if (studentVideoRef.current) {
          studentVideoRef.current.srcObject =
            stream;

          studentVideoRef.current.muted = true;
          studentVideoRef.current.playsInline = true;
          studentVideoRef.current.autoplay = true;

          try {
            await studentVideoRef.current.play();
          } catch (playError) {
            console.warn(
              "Camera video play warning:",
              playError
            );
          }
        }

        const videoTracks =
          stream.getVideoTracks();

        const audioTracks =
          stream.getAudioTracks();

        setCameraOn(
          videoTracks.length > 0
        );

        setMicrophoneOn(
          audioTracks.length > 0
        );

        setStatus(
          "Camera and microphone ready."
        );

        return true;
      } catch (err) {
        console.error(
          "Camera/microphone error:",
          err
        );

        const errorName =
          err instanceof DOMException
            ? err.name
            : "";

        let message =
          "Unable to access your camera or microphone.";

        if (
          errorName === "NotAllowedError"
        ) {
          message =
            "Camera/microphone permission was denied. Please allow access in Chrome and try again.";
        } else if (
          errorName === "NotFoundError"
        ) {
          message =
            "No camera or microphone was found on this device.";
        } else if (
          errorName === "NotReadableError"
        ) {
          message =
            "Your camera or microphone is being used by another application.";
        } else if (
          errorName === "SecurityError"
        ) {
          message =
            "Camera access was blocked by the browser.";
        }

        setError(message);

        setStatus(
          "Camera unavailable."
        );

        return false;
      }
    }, []);

  // ==========================================================
  // TOGGLE CAMERA
  // ==========================================================

  const toggleCamera = useCallback(() => {
    const stream = streamRef.current;

    if (!stream) {
      void startCameraAndMicrophone();
      return;
    }

    const videoTrack =
      stream.getVideoTracks()[0];

    if (!videoTrack) {
      return;
    }

    const newState =
      !videoTrack.enabled;

    videoTrack.enabled = newState;

    setCameraOn(newState);

    setStatus(
      newState
        ? "Camera turned ON."
        : "Camera turned OFF."
    );
  }, [startCameraAndMicrophone]);

  // ==========================================================
  // TOGGLE MICROPHONE
  // ==========================================================

  const toggleMicrophone = useCallback(() => {
    const stream = streamRef.current;

    if (!stream) {
      void startCameraAndMicrophone();
      return;
    }

    const audioTrack =
      stream.getAudioTracks()[0];

    if (!audioTrack) {
      return;
    }

    const newState =
      !audioTrack.enabled;

    audioTrack.enabled = newState;

    setMicrophoneOn(newState);

    if (!newState) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // Ignore
        }
      }

      setIsListening(false);
    }

    setStatus(
      newState
        ? "Microphone turned ON."
        : "Microphone turned OFF."
    );
  }, [startCameraAndMicrophone]);

  // ==========================================================
  // PLAY AVATAR
  // ==========================================================

  const playAvatar = useCallback(
    async () => {
      const video =
        avatarVideoRef.current;

      if (!video) {
        console.warn(
          "Avatar video element not found."
        );
        return;
      }

      try {
        video.muted = true;
        video.volume = 0;
        video.loop = true;

        await video.play();

        console.log(
          "AI avatar video is playing."
        );
      } catch (err) {
        console.warn(
          "Could not start avatar video:",
          err
        );
      }
    },
    []
  );

  // ==========================================================
  // LOAD BROWSER VOICES
  // ==========================================================

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("speechSynthesis" in window)
    ) {
      return;
    }

    const loadVoices = () => {
      window.speechSynthesis.getVoices();
    };

    loadVoices();

    window.speechSynthesis.onvoiceschanged =
      loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged =
        null;
    };
  }, []);

  // ==========================================================
  // START SPEECH RECOGNITION
  // ==========================================================

  const startSpeechRecognition =
    useCallback(() => {
      const speechWindow =
        window as SpeechRecognitionWindow;

      const Recognition =
        speechWindow.SpeechRecognition ||
        speechWindow.webkitSpeechRecognition;

      if (!Recognition) {
        setError(
          "Speech recognition is not supported. Please use Google Chrome."
        );

        setStatus(
          "Microphone ready. Speech recognition unavailable."
        );

        return;
      }

      const stream =
        streamRef.current;

      const audioTrack =
        stream?.getAudioTracks()[0];

      if (
        !audioTrack ||
        !audioTrack.enabled
      ) {
        setStatus(
          "Turn ON the microphone to answer by voice."
        );

        return;
      }

      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // Ignore
        }
      }

      const recognition =
        new Recognition();

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-IN";

      recognition.onstart = () => {
        setIsListening(true);

        setStatus(
          "Listening... Speak your answer."
        );
      };

      recognition.onresult = (
        event
      ) => {
        let transcript = "";

        for (
          let i = 0;
          i < event.results.length;
          i++
        ) {
          const result =
            event.results[i];

          if (
            result &&
            result[0]
          ) {
            transcript +=
              result[0].transcript +
              " ";
          }
        }

        const cleaned =
          transcript.trim();

        setAnswer(cleaned);

        if (
          speechTimeoutRef.current
        ) {
          window.clearTimeout(
            speechTimeoutRef.current
          );

          speechTimeoutRef.current =
            null;
        }

        if (cleaned.length > 10) {
          speechTimeoutRef.current =
            window.setTimeout(
              () => {
                setStatus(
                  "Answer captured. Click Submit Answer when ready."
                );
              },
              2500
            );
        }
      };

      recognition.onerror = (
        event
      ) => {
        console.warn(
          "Speech recognition error:",
          event
        );

        setIsListening(false);

        setStatus(
          "Speech recognition stopped. You can try speaking again."
        );
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current =
        recognition;

      try {
        recognition.start();
      } catch (err) {
        console.warn(
          "Recognition start error:",
          err
        );
      }
    }, []);

  // ==========================================================
  // SPEAK AI QUESTION - FEMALE VOICE
  // ==========================================================

  const speakQuestion =
    useCallback(
      (text: string) => {
        if (
          !text ||
          completed
        ) {
          return;
        }

        if (
          typeof window === "undefined" ||
          !("speechSynthesis" in window)
        ) {
          setStatus(
            "AI question ready. Please answer using your microphone."
          );

          return;
        }

        window.speechSynthesis.cancel();

        const utterance =
          new SpeechSynthesisUtterance(
            text
          );

        // ------------------------------------------------------
        // FEMALE AI INTERVIEWER VOICE
        // ------------------------------------------------------

        const voices =
          window.speechSynthesis.getVoices();

        const femaleVoice =
          voices.find((voice) =>
            /Microsoft Aria|Microsoft Jenny|Microsoft Zira|Google UK English Female|Google US English Female|Samantha|Karen|Moira|Victoria|Susan/i.test(
              voice.name
            )
          ) ||
          voices.find((voice) =>
            /female|woman|zira|aria|jenny|samantha|karen|victoria/i.test(
              voice.name
            )
          ) ||
          voices.find(
            (voice) =>
              voice.lang
                .toLowerCase()
                .includes("en-in")
          ) ||
          voices.find((voice) =>
            voice.lang
              .toLowerCase()
              .startsWith("en")
          );

        if (femaleVoice) {
          utterance.voice =
            femaleVoice;

          utterance.lang =
            femaleVoice.lang;
        } else {
          utterance.lang = "en-IN";
        }

        // Natural female HR-style voice
        utterance.rate = 0.92;
        utterance.pitch = 1.12;
        utterance.volume = 1;

        utterance.onstart = () => {
          setIsSpeaking(true);

          setStatus(
            "AI interviewer is speaking..."
          );

          void playAvatar();
        };

        utterance.onend = () => {
          setIsSpeaking(false);

          setStatus(
            "Your turn. Please answer."
          );

          window.setTimeout(() => {
            if (
              microphoneOn &&
              !completed
            ) {
              startSpeechRecognition();
            }
          }, 500);
        };

        utterance.onerror = () => {
          setIsSpeaking(false);

          setStatus(
            "Your turn. Please answer."
          );

          window.setTimeout(() => {
            if (
              microphoneOn &&
              !completed
            ) {
              startSpeechRecognition();
            }
          }, 500);
        };

        window.speechSynthesis.speak(
          utterance
        );
      },
      [
        playAvatar,
        startSpeechRecognition,
        microphoneOn,
        completed,
      ]
    );

  // ==========================================================
  // STOP SPEECH RECOGNITION
  // ==========================================================

  const stopSpeechRecognition =
    useCallback(() => {
      if (
        speechTimeoutRef.current
      ) {
        window.clearTimeout(
          speechTimeoutRef.current
        );

        speechTimeoutRef.current =
          null;
      }

      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // Ignore
        }
      }

      setIsListening(false);
    }, []);

  // ==========================================================
  // START INTERVIEW
  // ==========================================================

  const startInterview =
    async () => {
      if (
        isStarted ||
        isLoading
      ) {
        return;
      }

      setError("");
      setIsLoading(true);

      setStatus(
        "Starting interview..."
      );

      const mediaReady =
        await startCameraAndMicrophone();

      if (!mediaReady) {
        setIsLoading(false);
        return;
      }

      await playAvatar();

      try {
        const token =
          getToken();

        const headers: HeadersInit = {
          "Content-Type":
            "application/json",
        };

        if (token) {
          headers.Authorization =
            `Bearer ${token}`;
        }

        const response =
          await fetch(
            `${API_URL}/api/interview/start`,
            {
              method: "POST",
              headers,
              body: JSON.stringify({
                interview_type:
                  interviewType,
                type:
                  interviewType,
              }),
            }
          );

        if (!response.ok) {
          const text =
            await response.text();

          throw new Error(
            text ||
              `Server error: ${response.status}`
          );
        }

        const data =
          (await response.json()) as
            StartInterviewResponse;

        const id =
          data.interview_id ||
          data.id ||
          data.session_id;

        const firstQuestion =
          data.first_question ||
          data.question ||
          data.ai_question;

        if (!id) {
          throw new Error(
            "Backend did not return an interview ID."
          );
        }

        if (!firstQuestion) {
          throw new Error(
            "Backend did not return the first question."
          );
        }

        setInterviewId(id);

        setQuestion(
          firstQuestion
        );

        setAnswer("");

        setIsStarted(true);

        setCompleted(false);

        setStatus(
          "Interview started."
        );

        window.setTimeout(() => {
          speakQuestion(
            firstQuestion
          );
        }, 300);
      } catch (err) {
        console.error(
          "Start interview error:",
          err
        );

        const message =
          err instanceof Error
            ? err.message
            : "Unable to start interview.";

        setError(message);

        setStatus(
          "Could not start interview."
        );

        stopMedia();

        if (
          avatarVideoRef.current
        ) {
          avatarVideoRef.current.pause();
          avatarVideoRef.current.currentTime = 0;
        }
      } finally {
        setIsLoading(false);
      }
    };

  // ==========================================================
  // SUBMIT ANSWER
  // ==========================================================

  const submitAnswer =
    async () => {
      if (
        !interviewId ||
        !answer.trim() ||
        isSubmittingRef.current
      ) {
        return;
      }

      isSubmittingRef.current =
        true;

      setIsSubmitting(true);
      setError("");

      stopSpeechRecognition();

      window.speechSynthesis?.cancel();

      setIsSpeaking(false);

      setStatus(
        "Evaluating your answer..."
      );

      try {
        const token =
          getToken();

        const headers: HeadersInit = {
          "Content-Type":
            "application/json",
        };

        if (token) {
          headers.Authorization =
            `Bearer ${token}`;
        }

        const response =
          await fetch(
            `${API_URL}/api/interview/${interviewId}/answer`,
            {
              method: "POST",
              headers,
              body: JSON.stringify({
                answer:
                  answer.trim(),
              }),
            }
          );

        if (!response.ok) {
          const text =
            await response.text();

          throw new Error(
            text ||
              `Server error: ${response.status}`
          );
        }

        const data =
          (await response.json()) as
            AnswerResponse;

        const isFinished =
          Boolean(
            data.completed ||
            data.finished
          );

        if (isFinished) {
          setCompleted(true);

          setStatus(
            "Interview completed."
          );

          setQuestion(
            "Interview completed. Your feedback is being prepared."
          );

          stopSpeechRecognition();

          window.speechSynthesis?.cancel();

          setIsSpeaking(false);

          if (
            avatarVideoRef.current
          ) {
            avatarVideoRef.current.pause();
          }

          return;
        }

        const nextQuestion =
          data.next_question ||
          data.question ||
          data.ai_question;

        if (!nextQuestion) {
          setStatus(
            "Answer submitted."
          );

          return;
        }

        setQuestion(
          nextQuestion
        );

        setAnswer("");

        setStatus(
          "Next question..."
        );

        await playAvatar();

        window.setTimeout(() => {
          speakQuestion(
            nextQuestion
          );
        }, 300);
      } catch (err) {
        console.error(
          "Submit answer error:",
          err
        );

        const message =
          err instanceof Error
            ? err.message
            : "Unable to submit answer.";

        setError(message);

        setStatus(
          "Could not submit answer."
        );
      } finally {
        setIsSubmitting(false);

        isSubmittingRef.current =
          false;
      }
    };

  // ==========================================================
  // END INTERVIEW
  // ==========================================================

  const endInterview =
    () => {
      window.speechSynthesis?.cancel();

      stopSpeechRecognition();

      stopMedia();

      if (
        avatarVideoRef.current
      ) {
        avatarVideoRef.current.pause();
        avatarVideoRef.current.currentTime = 0;
      }

      setIsSpeaking(false);
      setIsListening(false);

      setIsStarted(false);

      setInterviewId(null);

      setQuestion(
        "Click Start Interview to begin your AI interview."
      );

      setAnswer("");

      setCompleted(false);

      setError("");

      setStatus(
        "Ready to Start"
      );
    };

  // ==========================================================
  // CLEANUP
  // ==========================================================

  useEffect(() => {
    const avatarVideo =
      avatarVideoRef.current;

    return () => {
      window.speechSynthesis?.cancel();

      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // Ignore
        }
      }

      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track) =>
            track.stop()
          );
      }

      if (
        speechTimeoutRef.current
      ) {
        window.clearTimeout(
          speechTimeoutRef.current
        );

        speechTimeoutRef.current =
          null;
      }

      if (avatarVideo) {
        avatarVideo.pause();
        avatarVideo.currentTime = 0;
      }
    };
  }, []);

  // ==========================================================
  // INTERVIEW NAME
  // ==========================================================

  const interviewName =
    interviewType === "technical"
      ? "Technical Interview"
      : interviewType === "hr"
        ? "HR Interview"
        : "Communication Interview";

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="w-full overflow-hidden rounded-3xl bg-slate-950 text-white">

      {/* HEADER */}

      <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5">
        <div>
          <h2 className="text-2xl font-bold">
            PrepSphere AI Interview
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            {interviewName}
          </p>
        </div>

        <div
          className={`rounded-full px-4 py-2 text-sm font-semibold ${
            completed
              ? "bg-green-500/20 text-green-400"
              : isStarted
                ? "bg-blue-500/20 text-blue-400"
                : "bg-slate-800 text-slate-300"
          }`}
        >
          {completed
            ? "Completed"
            : isStarted
              ? "Interview Active"
              : "Ready to Start"}
        </div>
      </div>

      {/* VIDEO AREA */}

      <div className="grid gap-5 p-5 lg:grid-cols-2">

        {/* AI AVATAR */}

        <div className="overflow-hidden rounded-2xl border border-slate-700 bg-black">

          <div className="border-b border-slate-700 bg-slate-900 px-5 py-4">
            <h3 className="font-semibold">
              AI Interviewer
            </h3>

            <p className="text-xs text-slate-400">
              PrepSphere Virtual Interviewer
            </p>
          </div>

          <div className="relative aspect-video overflow-hidden bg-slate-950">

            <video
              ref={avatarVideoRef}
              src="/interviewer.mp4"
              className="h-full w-full object-contain"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              controls={false}
              onLoadedData={() => {
                console.log(
                  "interviewer.mp4 loaded successfully"
                );
              }}
              onCanPlay={() => {
                if (isStarted) {
                  void playAvatar();
                }
              }}
              onPlay={() => {
                console.log(
                  "AI avatar is playing."
                );
              }}
              onError={(event) => {
                console.error(
                  "Avatar video error:",
                  event.currentTarget.error
                );

                setError(
                  "interviewer.mp4 could not be loaded. Make sure it is inside frontend/public/interviewer.mp4"
                );
              }}
            />

            {isSpeaking && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                <div className="rounded-full bg-black/75 px-5 py-2 text-sm font-semibold text-white shadow-lg">
                  🔊 AI Interviewer is speaking
                </div>
              </div>
            )}
          </div>
        </div>

        {/* STUDENT CAMERA */}

        <div className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-900">

          <div className="flex items-center justify-between border-b border-slate-700 px-5 py-4">

            <div>
              <h3 className="font-semibold">
                Student
              </h3>

              <p className="text-xs text-slate-400">
                Live camera and microphone
              </p>
            </div>

            {/* CAMERA + MIC */}

            <div className="flex items-center gap-2">

              <button
                type="button"
                onClick={toggleCamera}
                disabled={!isStarted}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                  cameraOn
                    ? "bg-green-500/15 text-green-400 hover:bg-green-500/25"
                    : "bg-red-500/15 text-red-400 hover:bg-red-500/25"
                } ${
                  !isStarted
                    ? "cursor-not-allowed opacity-50"
                    : ""
                }`}
              >
                {cameraOn
                  ? "📷 Camera ON"
                  : "📷 Camera OFF"}
              </button>

              <button
                type="button"
                onClick={toggleMicrophone}
                disabled={!isStarted}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                  microphoneOn
                    ? "bg-green-500/15 text-green-400 hover:bg-green-500/25"
                    : "bg-red-500/15 text-red-400 hover:bg-red-500/25"
                } ${
                  !isStarted
                    ? "cursor-not-allowed opacity-50"
                    : ""
                }`}
              >
                {microphoneOn
                  ? "🎤 Mic ON"
                  : "🔇 Mic OFF"}
              </button>

            </div>
          </div>

          {/* STUDENT VIDEO */}

          <div className="relative aspect-video bg-slate-950">

            <video
              ref={studentVideoRef}
              className="h-full w-full object-cover"
              autoPlay
              muted
              playsInline
            />

            {!cameraOn && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950">

                <div className="text-5xl">
                  📷
                </div>

                <p className="mt-3 text-sm text-slate-500">
                  {isStarted
                    ? "Camera is OFF"
                    : "Your live camera will appear here"}
                </p>

              </div>
            )}

            {isListening && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                <div className="rounded-full bg-red-600 px-5 py-2 text-sm font-semibold shadow-lg">
                  🔴 Listening...
                </div>
              </div>
            )}

          </div>
        </div>

      </div>

      {/* QUESTION */}

      <div className="mx-5 rounded-2xl border border-slate-700 bg-slate-900 p-6">

        <div className="mb-3 flex items-center gap-2 text-blue-400">
          <span>🤖</span>

          <span className="font-semibold">
            Interview Question
          </span>
        </div>

        <p className="text-xl leading-8 text-white">
          {question}
        </p>

      </div>

      {/* ANSWER */}

      {isStarted && (
        <div className="mx-5 mt-5 rounded-2xl border border-slate-700 bg-slate-900 p-5">

          <div className="mb-3 flex items-center justify-between">

            <span className="font-semibold">
              Your Answer
            </span>

            <span className="text-xs text-slate-400">
              {answer.length} characters
            </span>

          </div>

          <textarea
            value={answer}
            onChange={(event) => {
              setAnswer(
                event.target.value
              );
            }}
            placeholder="Your spoken answer will appear here..."
            className="min-h-[130px] w-full resize-none rounded-xl border border-slate-700 bg-slate-950 p-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
          />

          <div className="mt-4 flex flex-wrap gap-3">

            {/* VOICE BUTTON */}

            <button
              type="button"
              onClick={() => {
                if (isListening) {
                  stopSpeechRecognition();
                } else {
                  startSpeechRecognition();
                }
              }}
              disabled={
                isSpeaking ||
                isSubmitting ||
                !microphoneOn
              }
              className={`rounded-xl px-5 py-3 font-semibold transition ${
                isListening
                  ? "bg-red-600 hover:bg-red-500"
                  : "bg-slate-700 hover:bg-slate-600"
              } disabled:cursor-not-allowed disabled:opacity-50`}
            >
              {isListening
                ? "Stop Listening"
                : "🎙️ Answer by Voice"}
            </button>

            {/* SUBMIT */}

            <button
              type="button"
              onClick={
                submitAnswer
              }
              disabled={
                !answer.trim() ||
                isSubmitting ||
                isSpeaking ||
                completed
              }
              className="rounded-xl bg-blue-600 px-6 py-3 font-semibold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting
                ? "Evaluating..."
                : "Submit Answer"}
            </button>

          </div>
        </div>
      )}

      {/* STATUS / ERROR */}

      <div className="px-5 py-5">

        <div className="rounded-xl bg-slate-900 px-5 py-4">
          <p className="text-sm text-slate-300">

            <span className="font-semibold text-blue-400">
              Status:
            </span>{" "}

            {status}

          </p>
        </div>

        {error && (
          <div className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-4">

            <p className="text-sm text-red-300">
              {error}
            </p>

          </div>
        )}

      </div>

      {/* MAIN CONTROLS */}

      <div className="flex justify-center gap-4 px-5 pb-6">

        {!isStarted ? (
          <button
            type="button"
            onClick={
              startInterview
            }
            disabled={isLoading}
            className="rounded-xl bg-blue-600 px-8 py-4 font-semibold shadow-lg transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading
              ? "Starting..."
              : "🎙️ Start Interview"}
          </button>
        ) : (
          <button
            type="button"
            onClick={
              endInterview
            }
            className="rounded-xl bg-red-600 px-8 py-4 font-semibold transition hover:bg-red-500"
          >
            End Interview
          </button>
        )}

      </div>

      {/* INSTRUCTIONS */}

      <div className="border-t border-slate-800 bg-slate-900/60 px-6 py-5">

        <h3 className="font-semibold">
          Interview Instructions
        </h3>

        <ul className="mt-3 space-y-2 text-sm text-slate-400">

          <li>
            • Allow camera and microphone permission when Chrome asks.
          </li>

          <li>
            • The AI interviewer will speak using a female AI voice.
          </li>

          <li>
            • The avatar continuously plays while the interview is active.
          </li>

          <li>
            • Use the Camera ON/OFF button to control your camera.
          </li>

          <li>
            • Use the Mic ON/OFF button to control your microphone.
          </li>

          <li>
            • Speak clearly and naturally.
          </li>

          <li>
            • Your spoken answer will appear in the answer box.
          </li>

          <li>
            • Click Submit Answer when you finish speaking.
          </li>

        </ul>

      </div>

    </div>
  );
}