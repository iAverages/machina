// This file is auto-generated by @hey-api/openapi-ts

export type CurrentlyPlaying = {
    isPlaying: boolean;
    progress: number;
    track?: null | PlayingTrack;
};

export type CursorPaginatedI64VecListen = {
    cursor?: number;
    data: Array<{
        albumId?: string | null;
        albumName?: string | null;
        artistId?: string | null;
        artistName?: string | null;
        coverArt?: string | null;
        duration?: number | null;
        explicit?: number | null;
        id: string;
        name: string;
        time: number;
    }>;
};

export type Listen = {
    albumId?: string | null;
    albumName?: string | null;
    artistId?: string | null;
    artistName?: string | null;
    coverArt?: string | null;
    duration?: number | null;
    explicit?: number | null;
    id: string;
    name: string;
    time: number;
};

export type PlayingTrack = {
    albumArt?: string | null;
    albumName: string;
    artistName?: string | null;
    duration: number;
    trackId: string;
    trackName: string;
};

export type Profile = {
    currentPlaying: CurrentlyPlaying;
    listenStats: TotalListenStats;
    topTracks: Array<TopTrack>;
    user: UserProfile;
};

export type TopTrack = {
    albumArt?: string | null;
    albumName?: string | null;
    artistName?: string | null;
    duration?: number | null;
    listenCount: number;
    trackId: string;
    trackName: string;
};

export type TotalListenStats = {
    totalSeconds: number;
    uniqueTracksCount: number;
};

export type UserProfile = {
    id: string;
    image?: string | null;
    name: string;
};

export type UserProfileData = {
    body?: never;
    path: {
        /**
         * id of user to get profile for
         */
        id: string;
    };
    query?: never;
    url: '/api/profile/{id}';
};

export type UserProfileResponses = {
    /**
     * data for users public profile
     */
    200: Profile;
};

export type UserProfileResponse = UserProfileResponses[keyof UserProfileResponses];

export type ListenHistData = {
    body?: never;
    path: {
        /**
         * id of user to get profile for
         */
        id: string;
    };
    query?: {
        cursor?: number | null;
    };
    url: '/api/profile/{id}/history';
};

export type ListenHistResponses = {
    /**
     * listening history for given user
     */
    200: CursorPaginatedI64VecListen;
};

export type ListenHistResponse = ListenHistResponses[keyof ListenHistResponses];

export type ClientOptions = {
    baseUrl: 'http://localhost:3001' | (string & {});
};