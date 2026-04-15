export interface AnalyticsBreakdownItem {
  label: string;
  value: number;
}

export interface AdminAnalyticsResponse {
  generatedAt: string;
  totals: {
    totalAccounts: number;
    totalAdmins: number;
    totalTipsters: number;
    validatedTipsters: number;
    totalPosts: number;
    totalComments: number;
    totalReactions: number;
    totalSaves: number;
    totalUniqueViews: number;
    totalShares: number;
    totalReposts: number;
    totalFollows: number;
    resolvedPicks: number;
  };
  last30Days: {
    newTipsters: number;
    newPosts: number;
    newComments: number;
    newReactions: number;
    newFollows: number;
    newShares: number;
    recentlyResolvedPicks: number;
  };
  rates: {
    engagementPerPost: number;
    interactionRateOverViews: number;
    saveRateOverViews: number;
    shareRateOverViews: number;
    commentRateOverViews: number;
    likeRateOverViews: number;
    winRate: number;
  };
  postTypeBreakdown: AnalyticsBreakdownItem[];
  visibilityBreakdown: AnalyticsBreakdownItem[];
  pickResultBreakdown: AnalyticsBreakdownItem[];
  preferredCompetitions: AnalyticsBreakdownItem[];
  preferredTeams: AnalyticsBreakdownItem[];
  topTipsters: Array<{
    userId: number;
    displayName: string;
    username: string;
    validatedTipster: boolean;
    followersCount: number;
    postsCount: number;
    totalEngagement: number;
    resolvedPicks: number;
    wonPicks: number;
    winRate: number;
  }>;
}
