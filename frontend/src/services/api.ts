const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

// ==================== AUTH ====================

export async function registerUser(
  name: string,
  email: string,
  password: string,
  role: string = "student",
  adminCode?: string
) {
  const response = await fetch(
    `${API_BASE_URL}/api/auth/register`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        password,
        role,
        admin_code: adminCode,
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();

    throw new Error(
      errorData.detail || "Registration failed"
    );
  }

  return response.json();
}

export async function loginUser(
  email: string,
  password: string
) {
  const response = await fetch(
    `${API_BASE_URL}/api/auth/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();

    throw new Error(
      errorData.detail || "Login failed"
    );
  }

  return response.json();
}

// ==================== PROFILE ====================

export async function getMyProfile(
  token: string
) {
  const response = await fetch(
    `${API_BASE_URL}/api/profile/me`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to load profile");
  }

  return response.json();
}

export async function updateMyProfile(
  token: string,
  data: object
) {
  const response = await fetch(
    `${API_BASE_URL}/api/profile/me`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to update profile");
  }

  return response.json();
}

// ==================== RESUME ====================

export async function uploadResume(
  token: string,
  file: File
) {
  const formData = new FormData();

  formData.append("file", file);

  const response = await fetch(
    `${API_BASE_URL}/api/resume/upload`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    const errorData = await response.json();

    throw new Error(
      errorData.detail || "Resume upload failed"
    );
  }

  return response.json();
}

export async function getMyResume(
  token: string
) {
  const response = await fetch(
    `${API_BASE_URL}/api/resume/me`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    return null;
  }

  return response.json();
}

export async function getResumeResult(
  token: string
) {
  const response = await fetch(
    `${API_BASE_URL}/api/resume/me`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to load resume");
  }

  return response.json();
}

// ==================== SKILL GAP ====================

export async function getSkillGap(
  token: string
) {
  const response = await fetch(
    `${API_BASE_URL}/api/skill-gap/analyze`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json();

    throw new Error(
      errorData.detail ||
        "Failed to load skill gap analysis"
    );
  }

  return response.json();
}

// ==================== PLACEMENT HUB ====================

export async function getRoadmap(
  token: string
) {
  const response = await fetch(
    `${API_BASE_URL}/api/placement-hub/roadmap`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json();

    throw new Error(
      errorData.detail || "Failed to load roadmap"
    );
  }

  return response.json();
}

export async function getFoundationTrack(
  token: string
) {
  const response = await fetch(
    `${API_BASE_URL}/api/placement-hub/foundation-track`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json();

    throw new Error(
      errorData.detail ||
        "Failed to load foundation track"
    );
  }

  return response.json();
}

// ==================== STUDY VAULT ====================

export async function getStudyContent(
  token: string,
  skillName: string
) {
  const response = await fetch(
    `${API_BASE_URL}/api/study-vault/${encodeURIComponent(
      skillName
    )}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      "Failed to load study content"
    );
  }

  return response.json();
}

// ==================== QUIZ ====================

export async function getQuiz(
  token: string,
  skillName: string,
  difficulty: string
) {
  const response = await fetch(
    `${API_BASE_URL}/api/quiz/${encodeURIComponent(
      skillName
    )}?difficulty=${difficulty}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to load quiz");
  }

  return response.json();
}

export async function submitQuiz(
  token: string,
  skillName: string,
  difficulty: string,
  answers: number[]
) {
  const response = await fetch(
    `${API_BASE_URL}/api/quiz/submit`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        skill_name: skillName,
        difficulty,
        answers,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(
      "Failed to submit quiz"
    );
  }

  return response.json();
}

// ==================== READINESS ====================

export async function getReadinessScore(
  token: string
) {
  const response = await fetch(
    `${API_BASE_URL}/api/readiness/score`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json();

    throw new Error(
      errorData.detail ||
        "Failed to load readiness score"
    );
  }

  return response.json();
}

// ==================== SKILL PASSPORT ====================

export async function getSkillPassport(
  token: string
) {
  const response = await fetch(
    `${API_BASE_URL}/api/skill-passport`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json();

    throw new Error(
      errorData.detail ||
        "Failed to load skill passport"
    );
  }

  return response.json();
}

// ==================== INTERVIEW ====================

export async function startInterview(
  token: string,
  interviewType: string
) {
  const response = await fetch(
    `${API_BASE_URL}/api/interview/start`,
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

  if (!response.ok) {
    const errorData = await response.json();

    throw new Error(
      errorData.detail ||
        "Failed to start interview"
    );
  }

  return response.json();
}

export async function submitInterviewAnswer(
  token: string,
  interviewId: string,
  answer: string
) {
  const response = await fetch(
    `${API_BASE_URL}/api/interview/${interviewId}/answer`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        answer,
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();

    throw new Error(
      errorData.detail ||
        "Failed to submit answer"
    );
  }

  return response.json();
}

// ==================== SPEECH TO TEXT ====================

export async function transcribeAudio(
  token: string,
  audioBlob: Blob
) {
  const formData = new FormData();

  formData.append(
    "audio",
    audioBlob,
    "recording.webm"
  );

  const response = await fetch(
    `${API_BASE_URL}/api/interview/transcribe`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => null);

    throw new Error(
      errorData?.detail ||
        "Failed to transcribe audio"
    );
  }

  return response.json();
}

// ==================== DEPARTMENT ====================

export async function getDepartmentOverview(
  token: string
) {
  const response = await fetch(
    `${API_BASE_URL}/api/department/overview`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      "Failed to load department overview"
    );
  }

  return response.json();
}

// ==================== ADMIN ====================

export async function getAdminOverview(
  token: string
) {
  const response = await fetch(
    `${API_BASE_URL}/api/admin/overview`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      "Failed to load admin overview"
    );
  }

  return response.json();
}
export async function getAdminCompanies(
  token: string
) {
  const response = await fetch(
    `${API_BASE_URL}/api/admin/companies`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      "Failed to load companies"
    );
  }

  return response.json();
}
export async function addAdminCompany(
  token: string,
  company: {
    name: string;
    role?: string;
    package_lpa?: number;
    skills?: string[];
  }
) {
  const response = await fetch(
    `${API_BASE_URL}/api/admin/companies`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(company),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    throw new Error(
      errorData.detail ||
        "Failed to add company"
    );
  }

  return response.json();
}

export async function getAdminSkills(
  token: string
) {
  const response = await fetch(
    `${API_BASE_URL}/api/admin/skills`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      "Failed to load skills"
    );
  }

  return response.json();
}

export async function addAdminSkill(
  token: string,
  skill: {
    name: string;
    category?: string;
    description?: string;
  }
) {
  const response = await fetch(
    `${API_BASE_URL}/api/admin/skills`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(skill),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    throw new Error(
      errorData.detail ||
        "Failed to add skill"
    );
  }

  return response.json();
}