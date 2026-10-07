import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  useGLTF,
} from "@react-three/drei";
import * as THREE from "three";

/* =========================================================
   Types
   ========================================================= */

type VisemeCue = {
  start: number;
  end: number;
  viseme: string;
};

type LipSyncAvatarProps = {
  text?: string;
  autoSpeak?: boolean;
};

/* =========================================================
   Rhubarb → Sky Morph Target Mapping
   ========================================================= */

const RHUBARB_TO_SKY: Record<string, string> = {
  viseme_PP: "PP",
  viseme_kk: "kk",
  viseme_E: "E",
  viseme_aa: "aa",
  viseme_oh: "oh",
  viseme_ou: "ou",
  viseme_FF: "FF",
  viseme_RR: "RR",
  viseme_sil: "sil",
};

/* =========================================================
   Avatar Model
   ========================================================= */

function SkyModel({
  visemes,
  audio,
  speaking,
}: {
  visemes: VisemeCue[];
  audio: HTMLAudioElement | null;
  speaking: boolean;
}) {
  const { scene } = useGLTF("/model.glb");

  /*
   * Find all meshes that support facial morph targets.
   */
  const meshes = useMemo(() => {
    const result: THREE.Mesh[] = [];

    scene.traverse((object) => {
      if (
        object instanceof THREE.Mesh &&
        object.morphTargetDictionary &&
        object.morphTargetInfluences
      ) {
        result.push(object);
      }
    });

    return result;
  }, [scene]);

  /*
   * Smoothly close the mouth when there is no
   * active viseme.
   */
  const resetMorphTargets = () => {
    meshes.forEach((mesh) => {
      if (!mesh.morphTargetInfluences) {
        return;
      }

      for (
        let index = 0;
        index < mesh.morphTargetInfluences.length;
        index++
      ) {
        mesh.morphTargetInfluences[index] *= 0.72;
      }
    });
  };

  /*
   * Activate the required mouth shape.
   */
  const setMorphTarget = (
    targetName: string,
    value: number
  ) => {
    meshes.forEach((mesh) => {
      if (
        !mesh.morphTargetDictionary ||
        !mesh.morphTargetInfluences
      ) {
        return;
      }

      const index =
        mesh.morphTargetDictionary[targetName];

      if (index === undefined) {
        return;
      }

      mesh.morphTargetInfluences[index] =
        THREE.MathUtils.lerp(
          mesh.morphTargetInfluences[index],
          value,
          0.5
        );
    });
  };

  /*
   * Lip-sync animation.
   */
  useFrame(() => {
    resetMorphTargets();

    if (
      !speaking ||
      !audio ||
      audio.paused ||
      audio.ended
    ) {
      return;
    }

    const currentTime =
      audio.currentTime;

    const cue = visemes.find(
      (item) =>
        currentTime >= item.start &&
        currentTime <= item.end
    );

    if (!cue) {
      return;
    }

    const target =
      RHUBARB_TO_SKY[cue.viseme];

    if (!target || target === "sil") {
      return;
    }

    setMorphTarget(target, 1);
  });

  return (
    <primitive
      object={scene}
      /*
       * Slightly larger because we are now
       * presenting the avatar like a camera shot.
       */
      scale={1.12}
      position={[0, -1.62, 0]}
    />
  );
}

/* =========================================================
   Main Avatar Component
   ========================================================= */

export default function LipSyncAvatar({
  text = "",
  autoSpeak = false,
}: LipSyncAvatarProps) {
  const audioRef =
    useRef<HTMLAudioElement | null>(null);

  const requestIdRef =
    useRef(0);

  const [audio, setAudio] =
    useState<HTMLAudioElement | null>(null);

  const [visemes, setVisemes] =
    useState<VisemeCue[]>([]);

  const [speaking, setSpeaking] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  /* =======================================================
     Stop Current Audio
     ======================================================= */

  const stopCurrentAudio = useCallback(() => {
    const currentAudio =
      audioRef.current;

    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;

      currentAudio.onplay = null;
      currentAudio.onended = null;
      currentAudio.onerror = null;
    }

    audioRef.current = null;

    setAudio(null);
    setSpeaking(false);
  }, []);

  /* =======================================================
     Speak
     ======================================================= */

  const speak = useCallback(
    async (speechText: string) => {
      const cleanText =
        speechText.trim();

      if (!cleanText) {
        return;
      }

      /*
       * Create a unique request ID.
       */
      const currentRequestId =
        requestIdRef.current + 1;

      requestIdRef.current =
        currentRequestId;

      try {
        setLoading(true);

        /*
         * Stop any previous question audio.
         */
        stopCurrentAudio();

        /*
         * Generate speech + Rhubarb visemes.
         */
        const response = await fetch(
          "http://127.0.0.1:8000/api/interview/speak",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              text: cleanText,
            }),
          }
        );

        if (!response.ok) {
          throw new Error(
            `Speech API failed: ${response.status}`
          );
        }

        const data =
          await response.json();

        /*
         * Ignore an outdated request.
         */
        if (
          currentRequestId !==
          requestIdRef.current
        ) {
          return;
        }

        /*
         * Store viseme timeline.
         */
        setVisemes(
          data.visemes || []
        );

        if (!data.audio_url) {
          throw new Error(
            "Speech API did not return an audio URL."
          );
        }

        /*
         * Build full backend audio URL.
         */
        const audioUrl =
          `http://127.0.0.1:8000${data.audio_url}`;

        const newAudio =
          new Audio(audioUrl);

        newAudio.preload = "auto";

        /*
         * Store audio in ref + state.
         */
        audioRef.current =
          newAudio;

        setAudio(newAudio);

        /* -------------------------------------------------
           Audio Events
           ------------------------------------------------- */

        newAudio.onplay = () => {
          if (
            currentRequestId ===
            requestIdRef.current
          ) {
            setSpeaking(true);
          }
        };

        newAudio.onended = () => {
          if (
            currentRequestId ===
            requestIdRef.current
          ) {
            setSpeaking(false);
          }
        };

        newAudio.onerror = () => {
          if (
            currentRequestId ===
            requestIdRef.current
          ) {
            setSpeaking(false);

            console.error(
              "Could not play avatar audio."
            );
          }
        };

        /*
         * Start immediately.
         */
        await newAudio.play();
      } catch (error) {
        if (
          currentRequestId !==
          requestIdRef.current
        ) {
          return;
        }

        console.error(
          "Avatar speech error:",
          error
        );

        setSpeaking(false);
      } finally {
        if (
          currentRequestId ===
          requestIdRef.current
        ) {
          setLoading(false);
        }
      }
    },
    [stopCurrentAudio]
  );

  /* =======================================================
     Speak New Interview Question
     ======================================================= */

  useEffect(() => {
    if (!autoSpeak) {
      return;
    }

    const cleanText =
      text.trim();

    if (!cleanText) {
      return;
    }

    /*
     * Speak immediately when the question changes.
     */
    speak(cleanText);

    /*
     * Capture the ID created by this effect.
     */
    const cleanupRequestId =
      requestIdRef.current;

    return () => {
      /*
       * Invalidate only this request.
       */
      if (
        requestIdRef.current ===
        cleanupRequestId
      ) {
        requestIdRef.current =
          cleanupRequestId + 1;
      }

      /*
       * Stop previous audio.
       */
      const currentAudio =
        audioRef.current;

      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;

        currentAudio.onplay = null;
        currentAudio.onended = null;
        currentAudio.onerror = null;
      }

      audioRef.current = null;

      setAudio(null);
      setSpeaking(false);
    };
  }, [
    text,
    autoSpeak,
    speak,
  ]);

  /* =======================================================
     Final Cleanup
     ======================================================= */

  useEffect(() => {
    const audioElementRef =
      audioRef;

    return () => {
      const currentAudio =
        audioElementRef.current;

      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;

        currentAudio.onplay = null;
        currentAudio.onended = null;
        currentAudio.onerror = null;
      }

      audioElementRef.current = null;
    };
  }, []);

  /* =======================================================
     UI
     ======================================================= */

  return (
    <div
      style={{
        width: "100%",
        height: "520px",
        position: "relative",
        overflow: "hidden",
        borderRadius: "20px",
        background:
          "linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)",
      }}
    >
      <Canvas
        camera={{
          /*
           * Much closer camera.
           *
           * This turns the model preview into
           * an interviewer-style camera shot.
           */
          position: [0, 0.05, 2.05],
          fov: 28,
        }}
      >
        <ambientLight
          intensity={1.8}
        />

        <directionalLight
          position={[2, 3, 4]}
          intensity={2}
        />

        <directionalLight
          position={[-2, 2, 2]}
          intensity={1}
        />

        <SkyModel
          visemes={visemes}
          audio={audio}
          speaking={speaking}
        />

        <OrbitControls
          enablePan={false}
          enableZoom={false}
          enableRotate={false}
          target={[0, 0.05, 0]}
        />
      </Canvas>

      {/* =================================================
          Speaking Status
          ================================================= */}

      <div
        style={{
          position: "absolute",
          left: "16px",
          top: "16px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "8px 12px",
          borderRadius: "999px",
          background:
            "rgba(255,255,255,0.94)",
          fontSize: "13px",
          fontWeight: 600,
          boxShadow:
            "0 2px 8px rgba(0,0,0,0.08)",
        }}
      >
        <span
          style={{
            width: "7px",
            height: "7px",
            borderRadius: "50%",
            background: speaking
              ? "#22c55e"
              : loading
              ? "#f59e0b"
              : "#94a3b8",
          }}
        />

        {loading
          ? "Preparing..."
          : speaking
          ? "Speaking..."
          : "Ready"}
      </div>
    </div>
  );
}

/* =========================================================
   Preload Model
   ========================================================= */

useGLTF.preload("/model.glb");