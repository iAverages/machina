SELECT
    `user`.`id`,
    `account`.`accessToken` AS "spotify_access_token",
    `account`.`refreshToken` AS "spotify_refresh_token",
    `account`.`accessTokenExpiresAt` AS "spotify_expires_at"
FROM
    `user`
    INNER JOIN `account` ON `account`.`userId` = `user`.id
WHERE
    `account`.`providerId` = "spotify";
