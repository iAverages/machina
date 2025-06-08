SELECT
    CAST(
        (
            SELECT
                COUNT(*)
            FROM
                account
        ) AS SIGNED
    ) AS `account!: i64`,
    CAST(
        (
            SELECT
                COUNT(*)
            FROM
                album
        ) AS SIGNED
    ) AS `album!: i64`,
    CAST(
        (
            SELECT
                COUNT(*)
            FROM
                artist
        ) AS SIGNED
    ) AS `artist!: i64`,
    CAST(
        (
            SELECT
                COUNT(*)
            FROM
                listen
        ) AS SIGNED
    ) AS `listen!: i64`,
    CAST(
        (
            SELECT
                COUNT(*)
            FROM
                track
        ) AS SIGNED
    ) AS `track!: i64`,
    CAST(
        (
            SELECT
                COUNT(*)
            FROM
                `user`
        ) AS SIGNED
    ) AS `user!: i64`;
