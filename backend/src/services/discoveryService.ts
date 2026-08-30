import { GenderType, MatchPreferenceType } from "@prisma/client";
import { prisma } from "../config/db";
import { calculateAge } from "../utils/ageUtils";

// Haversine formula to compute great-circle distance between two points in km
export const calculateHaversineDistanceKm = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const getDiscoveryFeed = async (
  viewerAccountId: string,
  options?: {
    page?: number;
    limit?: number;
    maxDistanceKm?: number;
    minAge?: number;
    maxAge?: number;
  },
) => {
  const page = options?.page || 1;
  const limit = options?.limit || 20;
  const skip = (page - 1) * limit;

  // 1. Fetch viewer details
  const viewer = await prisma.user.findUnique({
    where: { accountId: viewerAccountId },
    include: {
      account: { select: { id: true, firstName: true, role: true } },
      church: { select: { id: true, officialName: true } },
      sentRequests: {
        where: { status: { in: ["PENDING", "ACCEPTED"] } },
        select: { receiverId: true },
      },
      matchParticipations: {
        select: {
          match: {
            select: {
              participants: {
                select: { userId: true },
              },
            },
          },
        },
      },
    },
  });

  if (!viewer) {
    throw new Error("Viewer not found");
  }

  // 2. Identify excluded user IDs (self, currently requested, previous matches)
  const excludedUserIds = new Set<string>([viewer.id]);
  viewer.sentRequests.forEach((req) => excludedUserIds.add(req.receiverId));
  viewer.matchParticipations.forEach((p) => {
    p.match.participants.forEach((part) => excludedUserIds.add(part.userId));
  });

  // 3. Determine target gender (opposite of viewer)
  const targetGender: GenderType = viewer.gender === "Male" ? "Female" : "Male";

  // 4. Church preference filter query
  const churchWhere: any = {};
  if (viewer.matchPreference === "my_church" && viewer.churchId) {
    churchWhere.churchId = viewer.churchId;
  } else if (viewer.matchPreference === "other_churches" && viewer.churchId) {
    churchWhere.churchId = { not: viewer.churchId };
  }

  // 5. Query candidate pool
  const candidateUsers = await prisma.user.findMany({
    where: {
      id: { notIn: Array.from(excludedUserIds) },
      gender: targetGender,
      vettingStatus: "VETTED_ACTIVE",
      isDiscoveryIndexed: true,
      account: {
        role: "User",
        status: "active",
      },
      ...churchWhere,
    },
    include: {
      account: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
      church: {
        select: {
          id: true,
          officialName: true,
          aka: true,
          state: true,
          city: true,
        },
      },
      photos: {
        orderBy: { order: "asc" },
        select: { url: true, order: true },
      },
    },
  });

  // 6. Apply Geographic Weighting and Ranking
  const viewerLat = viewer.residenceLatitude;
  const viewerLng = viewer.residenceLongitude;

  const scoredCandidates = candidateUsers
    .map((candidate) => {
      const candidateAge = calculateAge(candidate.dateOfBirth);

      // Filter by age if provided
      if (options?.minAge && candidateAge && candidateAge < options.minAge) {
        return null;
      }
      if (options?.maxAge && candidateAge && candidateAge > options.maxAge) {
        return null;
      }

      let distanceKm: number | null = null;
      if (
        viewerLat != null &&
        viewerLng != null &&
        candidate.residenceLatitude != null &&
        candidate.residenceLongitude != null
      ) {
        distanceKm = calculateHaversineDistanceKm(
          viewerLat,
          viewerLng,
          candidate.residenceLatitude,
          candidate.residenceLongitude,
        );
      }

      if (
        options?.maxDistanceKm &&
        distanceKm != null &&
        distanceKm > options.maxDistanceKm
      ) {
        return null;
      }

      // Proximity Score (1.0 for exact location, decaying with distance)
      const proximityScore = distanceKm != null ? 1 / (1 + distanceKm / 10) : 0.5;

      // Same-Church Affinity Bonus
      const sameChurchBonus =
        viewer.churchId && candidate.churchId === viewer.churchId ? 0.3 : 0;

      const totalScore = proximityScore + sameChurchBonus;

      return {
        userId: candidate.id,
        firstName: candidate.account.firstName,
        lastNameInitial: candidate.account.lastName
          ? candidate.account.lastName.charAt(0) + "."
          : "",
        age: candidateAge,
        gender: candidate.gender,
        occupation: candidate.occupation,
        interests: candidate.interests,
        matchPreference: candidate.matchPreference,
        originState: candidate.originState,
        residenceState: candidate.residenceState,
        residenceCity: candidate.residenceCity,
        distanceKm: distanceKm != null ? Math.round(distanceKm * 10) / 10 : null,
        church: candidate.church
          ? {
              id: candidate.church.id,
              name: candidate.church.officialName,
              aka: candidate.church.aka,
              city: candidate.church.city,
              state: candidate.church.state,
            }
          : null,
        branchName: candidate.branchName,
        photos: candidate.photos.map((p) => p.url),
        videoIntroUrl: candidate.videoIntroUrl,
        score: totalScore,
      };
    })
    .filter((c): c is NonNullable<typeof c> => c !== null);

  // Sort candidates by highest match score descending
  scoredCandidates.sort((a, b) => b.score - a.score);

  const paginatedCandidates = scoredCandidates.slice(skip, skip + limit);

  return {
    candidates: paginatedCandidates,
    pagination: {
      total: scoredCandidates.length,
      page,
      limit,
      totalPages: Math.ceil(scoredCandidates.length / limit),
    },
  };
};
