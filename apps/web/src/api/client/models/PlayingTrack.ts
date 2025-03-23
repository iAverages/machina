/* tslint:disable */
/* eslint-disable */
/**
 * machina
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: 0.1.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { mapValues } from '../runtime';
/**
 * 
 * @export
 * @interface PlayingTrack
 */
export interface PlayingTrack {
    /**
     * 
     * @type {string}
     * @memberof PlayingTrack
     */
    albumArt?: string | null;
    /**
     * 
     * @type {string}
     * @memberof PlayingTrack
     */
    albumName: string;
    /**
     * 
     * @type {string}
     * @memberof PlayingTrack
     */
    artistName?: string | null;
    /**
     * 
     * @type {number}
     * @memberof PlayingTrack
     */
    duration: number;
    /**
     * 
     * @type {string}
     * @memberof PlayingTrack
     */
    trackId: string;
    /**
     * 
     * @type {string}
     * @memberof PlayingTrack
     */
    trackName: string;
}

/**
 * Check if a given object implements the PlayingTrack interface.
 */
export function instanceOfPlayingTrack(value: object): value is PlayingTrack {
    if (!('albumName' in value) || value['albumName'] === undefined) return false;
    if (!('duration' in value) || value['duration'] === undefined) return false;
    if (!('trackId' in value) || value['trackId'] === undefined) return false;
    if (!('trackName' in value) || value['trackName'] === undefined) return false;
    return true;
}

export function PlayingTrackFromJSON(json: any): PlayingTrack {
    return PlayingTrackFromJSONTyped(json, false);
}

export function PlayingTrackFromJSONTyped(json: any, ignoreDiscriminator: boolean): PlayingTrack {
    if (json == null) {
        return json;
    }
    return {
        
        'albumArt': json['album_art'] == null ? undefined : json['album_art'],
        'albumName': json['album_name'],
        'artistName': json['artist_name'] == null ? undefined : json['artist_name'],
        'duration': json['duration'],
        'trackId': json['track_id'],
        'trackName': json['track_name'],
    };
}

export function PlayingTrackToJSON(json: any): PlayingTrack {
    return PlayingTrackToJSONTyped(json, false);
}

export function PlayingTrackToJSONTyped(value?: PlayingTrack | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'album_art': value['albumArt'],
        'album_name': value['albumName'],
        'artist_name': value['artistName'],
        'duration': value['duration'],
        'track_id': value['trackId'],
        'track_name': value['trackName'],
    };
}

