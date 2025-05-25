SELECT
    ROUND(CAST(SUM(t.duration) / 3600 AS DOUBLE), 2) AS `total_listening_hours!: f64`,
    COUNT(DISTINCT l.track_id) AS unique_tracks,
    COUNT(*) AS total_plays,
    ROUND(
        CAST(
            SUM(t.duration) / 3600 / GREATEST(
                1,
                DATEDIFF(
                    FROM_UNIXTIME(MAX(l.id) / 1000000),
                    FROM_UNIXTIME(MIN(l.id) / 1000000)
                ) / 7
            ) AS DOUBLE
        ),
        2
    ) AS `weekly_average!: f64`
FROM
    listen l
    JOIN track t ON t.id = l.track_id
WHERE
    l.user_id = ?;
