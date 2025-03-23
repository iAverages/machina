SELECT
    `account`.`accessToken` AS "spotify_access_token",
    `account`.`refreshToken` AS "spotify_refresh_token",
    `account`.`accessTokenExpiresAt` AS "spotify_expires_at"
FROM
    `account`
WHERE
    `account`.`userId` = ?;
