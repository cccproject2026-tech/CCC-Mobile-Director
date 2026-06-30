import { apiClient } from "./api/client";
import { ENDPOINTS } from "./api/endpoints";
import {
  CourseCompletedUser,
  InviteFieldMentorPayload,
  InviteFieldMentorResponse,
} from "@/types/progress.types";
import { Mentee, User, UserRole } from "@/types/user.types";
import { mapCourseCompletedStatus } from "@/utils/progressOverviewMerge";

export interface GetUsersParams {
  role?: UserRole | string;
  status?: string;
  page?: number;
  limit?: number;
  search?: string;
  roleMatch?: string;
  hasCompleted?: boolean;
}

export interface GetUsersApiResponse {
  success: boolean;
  message: string;
  data: {
    users: User[];
    page: number;
    totalPages: number;
    total: number;
  };
}

export const usersService = {
  getUsersByRole: async (
    role: UserRole,
    page: number = 1,
    limit: number = 10
  ): Promise<GetUsersApiResponse["data"]> => {
    const response = await apiClient.get<GetUsersApiResponse>(
      `${ENDPOINTS.USERS.GET_ALL_USERS(role)}${ENDPOINTS.USERS.GET_ALL_USERS(role).includes("?") ? "&" : "?"}page=${page}&limit=${limit}&roleMatch=mixed&t=${Date.now()}`
    );
    return response.data.data;
  },

  getAllUsers: async (params: GetUsersParams = {}): Promise<GetUsersApiResponse["data"]> => {
    const response = await apiClient.get<GetUsersApiResponse>(
      ENDPOINTS.USERS_COMPLETION.LIST,
      {
        params: { ...params, t: Date.now() },
      }
    );
    return response.data.data;
  },

  getUserById: async (userId: string): Promise<User> => {
    const response = await apiClient.get<{ success: boolean; data: User }>(
      ENDPOINTS.USERS.GET_USER(userId),
      { params: { t: Date.now() } }
    );
    return response.data.data;
  },

  markProgramComplete: async (userId: string): Promise<User> => {
    const response = await apiClient.patch<{ success: boolean; data: User; message?: string }>(
      ENDPOINTS.USERS_COMPLETION.MARK_COMPLETED(userId),
    );
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to mark programme complete");
    }
    return response.data.data;
  },

  issueCertificate: async (userId: string, issuedBy: string): Promise<User> => {
    const response = await apiClient.post<{ success: boolean; data: User; message?: string }>(
      ENDPOINTS.USERS_COMPLETION.ISSUE_CERTIFICATE(userId),
      { issuedBy }
    );
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to issue certificate");
    }
    return response.data.data;
  },

  inviteFieldMentor: async (payload: InviteFieldMentorPayload): Promise<InviteFieldMentorResponse> => {
    const response = await apiClient.post<InviteFieldMentorResponse>(
      ENDPOINTS.USERS_COMPLETION.INVITE_FIELD_MENTOR,
      payload
    );
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to send field mentor invitation");
    }
    return response.data;
  },

  mapToCourseCompletedUsers(users: User[]): CourseCompletedUser[] {
    return users
      .map((u) => {
        const status = mapCourseCompletedStatus(u as Mentee);
        if (!status) return null;
        const mentee = u as Mentee;
        return {
          id: u.id,
          name: `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || "Unknown",
          email: u.email,
          profilePicture: u.profilePicture,
          createdAt: u.createdAt,
          status,
          hasCompleted: mentee.hasCompleted,
          hasIssuedCertificate: mentee.hasIssuedCertificate,
          invitationDate: mentee.fieldMentorInvitation?.invitedAt
            ? new Date(mentee.fieldMentorInvitation.invitedAt).toLocaleDateString()
            : undefined,
          response: mentee.fieldMentorInvitation ? "Waiting" : undefined,
        } satisfies CourseCompletedUser;
      })
      .filter(Boolean) as CourseCompletedUser[];
  },
};
