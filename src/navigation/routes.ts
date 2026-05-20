import type { Href } from "expo-router";

export const Routes = {
  assessments: {
    index: "/assessments" as Href,
    create: "/assessments/create-assessment" as Href,
    select: "/assessments/select-assessment" as Href,
    assign: "/assessments/assign-assessments" as Href,
    editSections: "/assessments/edit-sections" as Href,
    editSectionsFor: (id: string): Href =>
      ({ pathname: "/assessments/edit-sections", params: { id } }) as Href,
    result: "/assessments/result" as Href,
    mentorPastors: "/assessments/mentor-pastors" as Href,
    detail: (id: string): Href =>
      ({ pathname: "/assessments/[id]", params: { id } }) as Href,
    assignWithIds: (assessmentIds: string[]): Href =>
      ({
        pathname: "/assessments/assign-assessments",
        params: { assessmentIds: JSON.stringify(assessmentIds) },
      }) as Href,
    resultFor: (assessmentId: string, userId: string): Href =>
      ({
        pathname: "/assessments/result",
        params: { assessmentId, userId },
      }) as Href,
    mentorPastorsFor: (mentorId: string): Href =>
      ({
        pathname: "/assessments/mentor-pastors",
        params: { mentorId },
      }) as Href,
    indexWithPastor: (pastorId: string): Href =>
      ({
        pathname: "/assessments",
        params: { assignUser: pastorId, tab: "assigned" },
      }) as Href,
  },
  progressTracker: {
    detail: (userId: string): Href =>
      ({ pathname: "/progress-tracker/[userId]", params: { userId } }) as Href,
    report: "/progress-tracker/report" as Href,
  },
  courseCompleted: "/course-completed" as Href,
  roadmaps: {
    index: "/roadmaps" as Href,
    select: "/roadmaps/select-roadmap" as Href,
    assign: "/roadmaps/assign-roadmaps" as Href,
    paths: "/roadmaps/roadmap-paths" as Href,
    phaseList: "/roadmaps/phase-list" as Href,
    task: "/roadmaps/task" as Href,
    mentorPastors: "/roadmaps/mentor-pastors" as Href,
    detail: (id: string): Href =>
      ({ pathname: "/roadmaps/[id]", params: { id } }) as Href,
    assignWithIds: (roadmapIds: string[]): Href =>
      ({
        pathname: "/roadmaps/assign-roadmaps",
        params: { roadmapIds: JSON.stringify(roadmapIds) },
      }) as Href,
    pathsForMentee: (menteeId: string): Href =>
      ({
        pathname: "/roadmaps/roadmap-paths",
        params: { id: menteeId },
      }) as Href,
    phaseListFor: (roadmapId: string, userId?: string, pastorView?: boolean): Href =>
      ({
        pathname: "/roadmaps/phase-list",
        params: {
          roadmapId,
          ...(userId ? { userId } : {}),
          ...(pastorView ? { pastorView: 'true' } : {}),
        },
      }) as Href,
    taskFor: (roadmapId: string, taskId: string, userId: string): Href =>
      ({
        pathname: "/roadmaps/task",
        params: { roadmapId, taskId, userId },
      }) as Href,
    mentorPastorsFor: (mentorId: string): Href =>
      ({
        pathname: "/roadmaps/mentor-pastors",
        params: { mentorId },
      }) as Href,
    indexWithPastor: (pastorId: string): Href =>
      ({
        pathname: "/roadmaps/roadmap-paths",
        params: { id: pastorId },
      }) as Href,
  },
} as const;
