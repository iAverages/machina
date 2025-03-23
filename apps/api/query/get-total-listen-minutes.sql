SELECT
    CAST(SUM(t.duration) AS int) AS `total_seconds!: i64`,
    COUNT(DISTINCT t.id) AS unique_tracks_count
FROM
    listen l
    JOIN track t ON l.track_id = t.id
WHERE
    l.user_id = ?
GROUP BY
    l.user_id
