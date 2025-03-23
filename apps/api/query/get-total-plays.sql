SELECT
    COUNT(*) AS total_plays
FROM
    listen
WHERE
    listen.user_id = ?
