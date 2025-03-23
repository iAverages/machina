SELECT
    t.id AS track_id,
    t.name AS track_name,
    t.duration AS duration,
    al.name AS album_name,
    al.cover_art AS album_art,
    a.name AS artist_name,
    COUNT(*) AS listen_count
FROM
    listen l
    JOIN track t ON l.track_id = t.id
    LEFT JOIN artist a ON t.artist_id = a.id
    LEFT JOIN album al ON t.album_id = al.id
WHERE
    l.user_id = ?
GROUP BY
    t.id,
    t.name,
    a.name
ORDER BY
    listen_count DESC
LIMIT
    12;
