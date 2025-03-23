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
  Profile,
} from '../models/index';
import {
    ProfileFromJSON,
    ProfileToJSON,
} from '../models/index';

export interface UserProfileRequest {
    id: number;
}

/**
 * 
 */
export class ProfileApi extends runtime.BaseAPI {

    /**
     */
    async userProfileRaw(requestParameters: UserProfileRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<Array<Profile>>> {
        if (requestParameters['id'] == null) {
            throw new runtime.RequiredError(
                'id',
                'Required parameter "id" was null or undefined when calling userProfile().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        const response = await this.request({
            path: `/api/{id}`.replace(`{${"id"}}`, encodeURIComponent(String(requestParameters['id']))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => jsonValue.map(ProfileFromJSON));
    }

    /**
     */
    async userProfile(requestParameters: UserProfileRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Array<Profile>> {
        const response = await this.userProfileRaw(requestParameters, initOverrides);
        return await response.value();
    }

}
