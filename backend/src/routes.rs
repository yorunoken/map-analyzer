use std::sync::Arc;

use crate::api::get;
use rosu_v2::Osu as OsuClient;
use warp::Filter;

pub fn routes(
    osu_client: Arc<OsuClient>,
) -> impl Filter<Extract = impl warp::Reply, Error = warp::Rejection> + Clone {
    let analyze_beatmap = warp::path!("api" / "beatmaps" / u32 / "analyze" / String)
        .and(warp::get())
        .and_then(get::analyze_beatmap);

    let beatmap_details = warp::path!("api" / "beatmaps" / u32 / "details")
        .and(warp::get())
        .and(with_osu_client(osu_client.clone()))
        .and_then(get::beatmap_details);

    analyze_beatmap.or(beatmap_details)
}

fn with_osu_client(
    osu_client: Arc<OsuClient>,
) -> impl Filter<Extract = (Arc<OsuClient>,), Error = std::convert::Infallible> + Clone {
    warp::any().map(move || osu_client.clone())
}
