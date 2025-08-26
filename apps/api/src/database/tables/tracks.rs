use sea_query::Iden;

#[derive(Debug, Iden)]
pub enum Listen {
    Table,
    Id,
    TrackId,
    UserId,
}

#[derive(Debug, Iden)]
pub enum Track {
    Table,
    Id,
    Name,
    Duration,
    Explicit,
    AlbumId,
    AristId,
}

#[derive(Debug, Iden)]
pub enum Arist {
    Table,
    Id,
    Name,
    ImageUrl,
}

#[derive(Debug, Iden)]
pub enum Album {
    Table,
    Id,
    Name,
    CoverArt,
}
