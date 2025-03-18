UPDATE
    `account`
SET
    `accessToken` = ?,
    `refreshToken` = ?,
    `accessTokenExpiresAt` = ?
WHERE
    `account`.`userId` = ?;
