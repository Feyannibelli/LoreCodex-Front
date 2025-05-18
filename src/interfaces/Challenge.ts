export interface Challenge {
    id: number;
    title: string;
    description: string;
    creatorId: number;
    creatorName: string;
    gameId: number;
    gameName: string;
    gameCoverImage: string;
    difficultyRating: number; // Average of user ratings (1-6)
    tasks: ChallengeTask[];
    completionsCount: number;
    participantsCount: number;
    mediaItems?: MediaItem[];
    createdAt: Date;
    updatedAt: Date;
}

export interface ChallengeTask {
    id: number;
    description: string;
    isCompleted?: boolean; // Only set when viewing a challenge as a participant
}

export interface MediaItem {
    type: 'image' | 'video';
    url: string;
}

export interface ChallengeFormData {
    title: string;
    description: string;
    gameId: number;
    difficultyRating: number;
    tasks: {
        id?: number;
        description: string;
    }[];
    mediaItems?: MediaItem[];
}

export interface ChallengeProgress {
    challengeId: number;
    completedTasks: number;
    totalTasks: number;
    progressPercentage: number;
}

export type DifficultyLevel = 1 | 2 | 3 | 4 | 5 | 6;

export const difficultyLabels: Record<DifficultyLevel, string> = {
    1: 'Very Easy',
    2: 'Easy',
    3: 'Medium',
    4: 'Hard',
    5: 'Very Hard',
    6: 'Extreme'
};