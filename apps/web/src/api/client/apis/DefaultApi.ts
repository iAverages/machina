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


import * as runtime from '../runtime';
import type {
  CursorPaginatedStringVecListen,
  Profile,
} from '../models/index';
import {
    CursorPaginatedStringVecListenFromJSON,
    CursorPaginatedStringVecListenToJSON,
    ProfileFromJSON,
    ProfileToJSON,
} from '../models/index';

export interface ListenHistRequest {
    id: string;
    cursor?: number | null;
}

export interface UserProfileRequest {
    id: string;
}

/**
 * 
 */
export class DefaultApi extends runtime.BaseAPI {

    /**
     */
    async listenHistRaw(requestParameters: ListenHistRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<CursorPaginatedStringVecListen>> {
        if (requestParameters['id'] == null) {
            throw new runtime.RequiredError(
                'id',
                'Required parameter "id" was null or undefined when calling listenHist().'
            );
        }

        const queryParameters: any = {};

        if (requestParameters['cursor'] != null) {
            queryParameters['cursor'] = requestParameters['cursor'];
        }

        const headerParameters: runtime.HTTPHeaders = {};

        const response = await this.request({
            path: `/api/profile/{id}/history`.replace(`{${"id"}}`, encodeURIComponent(String(requestParameters['id']))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => CursorPaginatedStringVecListenFromJSON(jsonValue));
    }

    /**
     */
    async listenHist(requestParameters: ListenHistRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<CursorPaginatedStringVecListen> {
        const response = await this.listenHistRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     */
    async userProfileRaw(requestParameters: UserProfileRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<Profile>> {
        if (requestParameters['id'] == null) {
            throw new runtime.RequiredError(
                'id',
                'Required parameter "id" was null or undefined when calling userProfile().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        const response = await this.request({
            path: `/api/profile/{id}`.replace(`{${"id"}}`, encodeURIComponent(String(requestParameters['id']))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => ProfileFromJSON(jsonValue));
    }

    /**
     */
    async userProfile(requestParameters: UserProfileRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Profile> {
        const response = await this.userProfileRaw(requestParameters, initOverrides);
        return await response.value();
    }

}
