SELECT
    listen.id AS time,
    track.*
FROM
    `listen`
    INNER JOIN track ON track_id = track.id
ORDER BY
    `time` DESC
