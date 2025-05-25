SELECT
    artist.id AS artist_id,
    artist.name AS artist_name,
    COUNT(listen.id) AS listen_count
FROM
    listen
    JOIN track ON listen.track_id = track.id
    JOIN artist ON track.artist_id = artist.id -- WHERE
WHERE
    listen.user_id = ?
GROUP BY
    artist.id,
    artist.name
ORDER BY
    listen_count DESC
LIMIT
    5;
