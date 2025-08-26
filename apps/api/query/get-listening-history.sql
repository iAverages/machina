SELECT
    listen.id AS time,
    --
    track.id,
    track.duration,
    track.explicit,
    track.album_id,
    track.artist_id,
    track.name AS `name!: String`,
    --
    artist.name AS artist_name,
    album.name AS album_name,
    album.cover_art AS cover_art
FROM
    `listen`
    INNER JOIN track ON listen.track_id = track.id
    LEFT OUTER JOIN artist ON track.artist_id = artist.id
    LEFT OUTER JOIN album ON track.album_id = album.id
WHERE
    listen.user_id = ?
    AND listen.id < ?
    AND listen.track_id IS NOT NULL
    AND track.name IS NOT NULL
ORDER BY
    `time` DESC
LIMIT
    ?
