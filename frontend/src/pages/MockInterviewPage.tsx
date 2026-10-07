import { useState, type ReactNode } from "react";

import {
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Info,
  Code2,
  Briefcase,
  MessageCircle,
  ArrowLeft,
} from "lucide-react";

import {
  PageHeader,
  Card,
} from "@/components/ui";

import type { PageId } from "@/components/AppShell";

import TavusInterviewer from "@/components/TavusInterviewer";


// =========================================================
// TYPES
// =========================================================

interface MockInterviewPageProps {
  onNavigate: (page: PageId) => void;
}

type InterviewType =
  | "technical"
  | "hr"
  | "communication";


// =========================================================
// INTERVIEW TYPES
// =========================================================

const INTERVIEW_TYPES: {
  id: InterviewType;
  title: string;
  description: string;
  icon: ReactNode;
}[] = [
  {
    id: "technical",
    title: "Technical Interview",
    description:
      "Practice programming, databases, projects, computer science and technical problem-solving.",
    icon: <Code2 className="h-6 w-6" />,
  },

  {
    id: "hr",
    title: "HR Interview",
    description:
      "Practice strengths, weaknesses, career goals, motivation, teamwork and workplace questions.",
    icon: <Briefcase className="h-6 w-6" />,
  },

  {
    id: "communication",
    title: "Communication Interview",
    description:
      "Improve speaking, confidence, clarity, fluency and professional communication.",
    icon: <MessageCircle className="h-6 w-6" />,
  },
];


// =========================================================
// MAIN COMPONENT
// =========================================================

export default function MockInterviewPage({
  onNavigate,
}: MockInterviewPageProps) {

  // The parent AppShell still provides onNavigate.
  // The current interview flow does not need it directly.
  void onNavigate;

  const [screen, setScreen] = useState<
    "types" | "interview"
  >("types");

  const [selectedType, setSelectedType] =
    useState<InterviewType | null>(null);


  // =======================================================
  // SELECT INTERVIEW TYPE
  // =======================================================

  const handleSelectType = (
    type: InterviewType
  ) => {

    setSelectedType(type);
  };


  // =======================================================
  // START INTERVIEW
  // =======================================================

  const handleStartInterview = () => {

    if (!selectedType) {
      return;
    }

    setScreen("interview");
  };


  // =======================================================
  // BACK TO INTERVIEW TYPES
  // =======================================================

  const handleBackToTypes = () => {

    setScreen("types");
  };


  // =======================================================
  // SCREEN 1 — INTERVIEW TYPES
  // =======================================================

  if (screen === "types") {

    return (

      <div className="space-y-6">

        <PageHeader
          title="AI Mock Interview"
          subtitle="Choose an interview type and practice with your AI interviewer."
        />


        {/* =================================================
            INTRO CARD
            ================================================= */}

        <Card className="p-8">

          <div className="flex items-start gap-4">

            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-violet-500/10">

              <Sparkles className="h-7 w-7 text-violet-500" />

            </div>


            <div>

              <h2 className="text-xl font-semibold text-slate-900">

                Choose Your Interview

              </h2>


              <p className="mt-2 text-sm leading-6 text-slate-600">

                Select the type of interview you want to
                practice. Your PrepSphere AI interviewer
                will conduct the session based on your
                selection.

              </p>

            </div>

          </div>


          {/* =================================================
              INTERVIEW TYPE CARDS
              ================================================= */}

          <div className="mt-8 grid gap-5 md:grid-cols-3">

            {INTERVIEW_TYPES.map((item) => {

              const isSelected =
                selectedType === item.id;

              return (

                <button
                  key={item.id}
                  type="button"
                  onClick={() =>
                    handleSelectType(item.id)
                  }
                  className={`group relative rounded-2xl border p-5 text-left transition-all ${
                    isSelected
                      ? "border-violet-500 bg-violet-50 ring-2 ring-violet-500/20"
                      : "border-slate-200 bg-white hover:border-violet-300 hover:bg-slate-50"
                  }`}
                >

                  {/* SELECTED CHECK */}

                  {isSelected && (

                    <div className="absolute right-4 top-4">

                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-600 text-white">

                        <CheckCircle2 className="h-4 w-4" />

                      </div>

                    </div>

                  )}


                  {/* ICON */}

                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                      isSelected
                        ? "bg-violet-600 text-white"
                        : "bg-violet-50 text-violet-600"
                    }`}
                  >

                    {item.icon}

                  </div>


                  {/* TITLE */}

                  <h3 className="mt-5 text-base font-semibold text-slate-900">

                    {item.title}

                  </h3>


                  {/* DESCRIPTION */}

                  <p className="mt-2 text-sm leading-6 text-slate-600">

                    {item.description}

                  </p>


                  {/* SELECTION STATUS */}

                  <div
                    className={`mt-5 text-sm font-medium ${
                      isSelected
                        ? "text-violet-600"
                        : "text-slate-500 group-hover:text-violet-600"
                    }`}
                  >

                    {isSelected
                      ? "Selected"
                      : "Select Interview →"}

                  </div>

                </button>

              );

            })}

          </div>


          {/* =================================================
              START BUTTON
              ================================================= */}

          <button
            type="button"
            onClick={handleStartInterview}
            disabled={!selectedType}
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3.5 font-medium text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
          >

            <span>

              Start{" "}

              {selectedType
                ? INTERVIEW_TYPES.find(
                    (item) =>
                      item.id === selectedType
                  )?.title
                : "Mock Interview"}

            </span>


            <ArrowRight className="h-5 w-5" />

          </button>

        </Card>


        {/* =================================================
            BEFORE YOU BEGIN
            ================================================= */}

        <Card className="p-6">

          <div className="flex items-center gap-3">

            <Info className="h-5 w-5 text-violet-500" />

            <h3 className="font-semibold text-slate-900">

              Before You Begin

            </h3>

          </div>


          <div className="mt-5 grid gap-4 md:grid-cols-3">

            <InfoItem
              title="Allow Camera"
              text="Allow camera and microphone access when Chrome asks."
            />


            <InfoItem
              title="Answer Naturally"
              text="Speak clearly and treat the AI interviewer like a real interviewer."
            />


            <InfoItem
              title="AI Evaluation"
              text="Your answers are sent to the PrepSphere AI backend for evaluation."
            />

          </div>

        </Card>

      </div>

    );
  }


  // =======================================================
  // SCREEN 2 — AI INTERVIEW
  // =======================================================

  return (

    <div className="space-y-6">

      <PageHeader
        title={
          selectedType === "technical"
            ? "Technical Interview"
            : selectedType === "hr"
            ? "HR Interview"
            : "Communication Interview"
        }
        subtitle="Practice your interview with the PrepSphere AI interviewer."
      >

        <button
          type="button"
          onClick={handleBackToTypes}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >

          <ArrowLeft className="h-4 w-4" />

          Change Type

        </button>

      </PageHeader>


      {/* =================================================
          SINGLE AI INTERVIEW ROOM

          IMPORTANT:
          Do NOT add AIInterviewRoom here.
          Do NOT add textarea here.
          Do NOT add old Answer by Voice button here.

          TavusInterviewer handles:
          - AI avatar
          - AI voice
          - student webcam
          - microphone
          - speech recognition
          - Groq/backend questions
          - answer submission
          - next questions
          ================================================= */}

      {selectedType && (

        <TavusInterviewer
          interviewType={selectedType}
        />

      )}

    </div>

  );
}


// =========================================================
// INFO ITEM
// =========================================================

function InfoItem({
  title,
  text,
}: {
  title: string;
  text: string;
}) {

  return (

    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

      <p className="font-medium text-slate-900">

        {title}

      </p>


      <p className="mt-1 text-sm leading-6 text-slate-600">

        {text}

      </p>

    </div>

  );
}