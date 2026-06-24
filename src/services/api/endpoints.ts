import { UserRole } from "@/types/user.types";

export const ENDPOINTS = {
  // Authentication (Unauthenticated routes)
  AUTH: {
    LOGIN: "/auth/login",
    SEND_OTP: "/auth/send-otp",
    VERIFY_OTP: "/auth/verify-otp",
    SET_PASSWORD: "/auth/set-password",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
    REFRESH_TOKEN: "/auth/refresh-token",
    LOGOUT: "/auth/logout",
    GOOGLE: "/auth/google",
  },

  GOOGLE_CALENDAR: {
    STATUS: "/google-calendar/status",
  },

    // Users
    USERS: {
        GET_ALL_USERS: (role?: UserRole) => `/users?role=${role}`,
        GET_USER: (userId: string) => `/users/${userId}`,
        UPDATE_USER: (userId: string) => `/users/${userId}`,
        CHECK_STATUS: (userId: string) => `/users/check-status/${userId}`,
        GET_INTERESTS: (email: string) => `/interests/by-email/${email}`,
        UPDATE_INTERESTS: (email: string) => `/interests/by-email/${email}`,
        GET_PROGRESS: (userId: string) => `/progress/${userId}`,
        UPDATE_PROFILE_PICTURE: (userId: string) => `/users/${userId}/profile-picture`,
        GET_DOCUMENTS: (userId: string) => `/users/${userId}/documents`,
        UPLOAD_DOCUMENT: (userId: string) => `/users/${userId}/documents`,
        DELETE_DOCUMENT: (userId: string) => `/users/${userId}/documents`,
        NOTES: (userId: string) => `/users/${userId}/notes`,
        NOTE_BY_ID: (userId: string, noteId: string) => `/users/${userId}/notes/${noteId}`,
    },

  // Pastor Onboarding (if separate from auth)
  ONBOARDING: {
    SUBMIT_INTEREST: "/interests",
    CHECK_STATUS: (userId: string) => `/users/check-status/${userId}`,
  },

  MENTORS: {
    GET_ASSIGNED_MENTORS: (menteeId: string) => `/users/${menteeId}/assigned`,
    GET_ALL_MENTORS: "/users?role=mentor&roleMatch=mixed",
    ASSIGN_MENTEES: (mentorId: string) => `/users/${mentorId}/assign`,
    REMOVE_MENTEES: (mentorId: string) => `/users/${mentorId}/remove`,
  },
  MENTEES: {
    GET_ASSIGNED_MENTEES: (mentorId: string) => `/users/${mentorId}/assigned`,
    GET_ALL_MENTEES: "/users?role=pastor&roleMatch=mixed",
    ASSIGN_MENTORS: (menteeId: string) => `/users/${menteeId}/assign`,
    REMOVE_MENTORS: (menteeId: string) => `/users/${menteeId}/remove`,
  },
  // Home
  HOME: {
    MENTEES: "/home/mentees",
    MENTORS: "/home/mentors",
    NOTIFICATIONS: "/home/notifications",
    GET_MENTOR_BY_EMAIL: (email: string) => `/home/mentor/${email}`,
    GET_MENTEE_BY_EMAIL: (email: string) => `/home/mentee/${email}`,
  },

  // Profile (Authenticated routes)
  PROFILE: {
    UPDATE_PROFILE: "/users/me",
    UPLOAD_AVATAR: "/users/me/avatar",
  },

    // Assessments
    ASSESSMENTS: {
        GET_ASSESSMENTS: '/assessment',
        GET_ASSESSMENT_BY_ID: (assessmentId: string) => `/assessment/${assessmentId}`,
        ASSIGN_ASSESSMENT: (assessmentId: string) => `/assessment/${assessmentId}/assign`,
        CREATE_ASSESSMENT: '/assessment',
        SUBMIT_ASSESSMENT_ANSWERS: (id: string) => `/assessment/${id}/answers`,
        SUBMIT_ASSESSMENT_PRESURVEY: (id: string) => `/assessment/${id}/pre-survey`,
        FETCH_ANSWERS: (assessmentId: string, userId: string) =>
            `/assessment/${assessmentId}/answers/${userId}`,
        GET_ASSIGNED: (userId: string) => `/assessment/assigned/${userId}`,
        GET_RECOMMENDATIONS: (assessmentId: string, userId: string) =>
            `/assessment/${assessmentId}/recommendations/${userId}`,
        DELETE_ASSESSMENT: '/assessment',
        UPDATE_INSTRUCTIONS: (assessmentId: string) => `/assessment/${assessmentId}/instructions`,
        UPDATE_SECTIONS: (assessmentId: string) => `/assessment/${assessmentId}/sections`,
        UPLOAD_BANNER_IMAGE: (assessmentId: string) => `/assessment/${assessmentId}/banner-image`,
    },

  GRANT: {
    CHECK_APPLICATION: (userId: string) =>
      `/microgrant/application/check/${userId}`,
    GET_FORM: "/microgrant/form",
    APPLY_GRANT: "/microgrant/apply",
    GET_APPLICATIONS: (status?: string) =>
      status
        ? `/microgrant/applications?status=${status}`
        : "/microgrant/applications",
    GET_APPLICATION: (applicationId: string) =>
      `/microgrant/application/${applicationId}`,
    UPDATE_APPLICATION_STATUS: (applicationId: string) =>
      `/microgrant/application/${applicationId}/status`,
  },

  AVAILABILITY: {
    MERGED: (mentorUserId: string) => `/availability/${mentorUserId}`,
  },

  APPOINTMENTS: {
    GET: (userId: string) => `/appointments/user/${userId}`,
    CREATE: "/appointments",
    GET_BY_MENTOR: (mentorId: string) => `/appointments/mentor/${mentorId}`,
    GET_BY_ID: (appointmentId: string) => `/appointments/${appointmentId}`,
    UPDATE: (appointmentId: string) => `/appointments/${appointmentId}`,
    GET_WEEKLY_AVAILABILITY: (mentorId: string) =>
      `/appointments/availability/${mentorId}`,
    GET_MONTHLY_AVAILABILITY: (mentorId: string, month: number, year: number) =>
      `/appointments/availability/${mentorId}/month?month=${month}&year=${year}`,
    SET_AVAILABILITY: "/appointments/availability",
    CREATE_RECURRING_AVAILABILITY: "/appointments/availability/recurring",
    PATCH_AVAILABILITY_DAY: (mentorId: string) =>
      `/appointments/availability/${mentorId}/day`,
    PATCH_AVAILABILITY_SETTINGS: (mentorId: string) =>
      `/appointments/availability/${mentorId}/settings`,
    MARK_DAY_UNAVAILABLE: (mentorId: string) =>
      `/appointments/availability/${mentorId}/day/unavailable`,
    MARK_DAY_AVAILABLE: (mentorId: string) =>
      `/appointments/availability/${mentorId}/day/available`,
    DELETE_AVAILABILITY_DAY: (mentorId: string, dateYmd: string) =>
      `/appointments/availability/${mentorId}/day/${dateYmd.slice(0, 10)}`,
    DELETE_AVAILABILITY_SLOT: (mentorId: string) =>
      `/appointments/availability/${mentorId}/slot`,
    RESCHEDULE: (appointmentId: string) =>
      `/appointments/${appointmentId}/reschedule`,
    CANCEL: (appointmentId: string) =>
      `/appointments/${appointmentId}/cancel`,
    UPCOMING: () => `/appointments/upcoming`,
    SEARCH_WITH_DATE: (userId: string | null, date: string | null) =>
      `/appointments/availability/${userId}/week?date=${date}`,
  },

  ROADMAPS: {
    GET_ALL: "/roadmaps",
    CREATE: "/roadmaps",
    GET_ROADMAP: (roadmapId: string) => `/roadmaps/${roadmapId}`,
    UPDATE: (roadmapId: string) => `/roadmaps/${roadmapId}`,
    ADD_COMMENT: (roadmapId: string) => `/roadmaps/${roadmapId}/comments`,
    GET_COMMENTS: (roadmapId: string, userId: string) =>
      `/roadmaps/${roadmapId}/comments?userId=${userId}`,
    SUBMIT_QUERY: (roadmapId: string) => `/roadmaps/${roadmapId}/queries`,
    GET_QUERIES: (roadmapId: string, userId: string) =>
      `/roadmaps/${roadmapId}/queries?userId=${userId}`,
    REPLY_QUERY: (roadmapId: string, queryId: string) =>
      `/roadmaps/${roadmapId}/queries/${queryId}/reply`,
    CREATE_NESTED: (roadmapId: string) => `/roadmaps/${roadmapId}/nested`,
    UPDATE_NESTED: (roadmapId: string, nestedId: string) =>
      `/roadmaps/${roadmapId}/nested/${nestedId}`,
    DELETE_ROADMAP: (roadmapId: string) => `/roadmaps/${roadmapId}`,
    GET_NESTED: (roadmapId: string, nestedId: string) =>
      `/roadmaps/${roadmapId}/nested/${nestedId}`,
    GET_USER_ROADMAPS: (userId: string) => `/roadmaps/user/${userId}`,
    GET_EXTRAS: (roadmapId: string) => `/roadmaps/${roadmapId}/extras`,
    GET_EXTRAS_DOCUMENTS: (roadmapId: string) =>
      `/roadmaps/${roadmapId}/extras/documents`,
    DELETE_QUERY_REPLY: (roadmapId: string, queryId: string) =>
      `/roadmaps/${roadmapId}/queries/${queryId}/reply`,
  },

  INTERESTS: {
    GET_ALL: "/interests",
    GET_METADATA: "/interests/metadata",
    UPDATE_STATUS: (id: string) => `/interests/request/${id}`,
    DELETE_BY_ID: (id: string) => `/interests/by-id/${id}`,
    FORM_CONFIG: "/interests/form-fields",
    ADD_DYNAMIC_FIELD: "/interests/dynamic-fields",
    REMOVE_DYNAMIC_FIELD: (fieldId: string) =>
      `/interests/dynamic-fields/${fieldId}`,
    SUBMIT_INTEREST: "/interests",
  },

  // Progress
  PROGRESS: {
    ASSIGN_ASSESSMENT: "/progress/assign-assessment",
    ASSIGN_ROADMAP: "/progress/assign-roadmap",
    FINAL_COMMENTS: "/progress/final-comments",
    GET_FINAL_COMMENTS: (userId: string) =>
      `/progress/${userId}/final-comments`,
    DIRECTOR_OVERVIEW: "/progress/overview/director",
    OVERVIEW_ALL: "/progress/overview/all",
  },

  USERS_COMPLETION: {
    MARK_COMPLETED: (userId: string) => `/users/${userId}/mark-completed`,
    ISSUE_CERTIFICATE: (userId: string) => `/users/${userId}/issue-certificate`,
    INVITE_FIELD_MENTOR: "/users/invite-field-mentor",
    LIST: "/users",
  },

  CERTIFICATES: {
    ISSUE: "/certificates/issue",
    USER: (userId: string) => `/certificates/user/${encodeURIComponent(userId)}`,
  },

  // Directors
  SUPER_ADMIN: {
    GET_ALL_DIRECTORS: "/super-admin/directors",
    CREATE_DIRECTOR: "/super-admin/directors",
    GET_DIRECTOR_BY_ID: (id: string) => `/super-admin/directors/${id}`,
    UPDATE_DIRECTOR: (id: string) => `/super-admin/directors/${id}`,
    DELETE_DIRECTOR: (id: string) => `/super-admin/directors/${id}`,
    ADD_USER: "/users",
  },
  SCHOLARSHIPS: {
    GET_ALL: (status?: string) =>
      status ? `/scholarships?status=${status}` : "/scholarships",
    GET_STATS: "/scholarships/statistics",
    ADD_AWARDED_USER: (scholarshipId: string) =>
      `/scholarships/${scholarshipId}/awarded-users`,
    UPDATE_AWARDED_USER: (scholarshipId: string, index: number) =>
      `/scholarships/${scholarshipId}/awarded-users/${index}`,
  },
} as const;
