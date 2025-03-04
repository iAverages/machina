UPDATE
    `user`
SET
    `spotify_access_token` = ?,
    `spotify_refresh_token` = ?,
    `spotify_expires_at` = ?
WHERE
    `user`.`id` = ?;
