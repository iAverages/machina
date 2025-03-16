INSERT INTO
    `user`(
        `id`,
        `name`,
        `spotify_id`,
        `spotify_access_token`,
        `spotify_expires_at`,
        `spotify_refresh_token`
    )
VALUES
    (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY
UPDATE
    `name` =
VALUES
    (`name`),
    `spotify_id` =
VALUES
    (`spotify_id`),
    `spotify_access_token` =
VALUES
    (`spotify_access_token`),
    `spotify_expires_at` =
VALUES
    (`spotify_expires_at`),
    `spotify_refresh_token` =
VALUES
    (`spotify_refresh_token`)
