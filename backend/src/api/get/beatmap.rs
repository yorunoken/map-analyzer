use osu_map_analyzer::{analyze, rosu_map};
use rosu_pp::{Beatmap, Difficulty};
use serde_json::Value;

use rosu_v2::{prelude::RankStatus, Osu as OsuClient};
use serde::Serialize;
use std::{
    fs::File,
    io::{ErrorKind, Read},
    path::Path,
    str::FromStr,
    sync::Arc,
};
use warp::{http::StatusCode, reply, Rejection, Reply};

use crate::utils::download_beatmap;

#[derive(Serialize)]
struct ApiError {
    error: String,
}

#[derive(Serialize)]
struct Statistics {
    star_rating: f64,
    bpm: f64,
    ar: f32,
    od: f32,
    hp: f32,
    cs: f32,
}

#[derive(Serialize)]
struct DetailsResult {
    title: String,
    artist: String,
    creator: String,
    version: String,
    set_id: u32,
    statistics: Statistics,
}

pub async fn beatmap_details(
    beatmap_id: u32,
    osu_client: Arc<OsuClient>,
) -> Result<impl Reply, Rejection> {
    let beatmap = match osu_client.beatmap().map_id(beatmap_id).await {
        Ok(ok) => ok,
        Err(err) => {
            eprintln!("Error while fetching beatmap: {}", err);
            return Ok(reply::with_status(
                reply::json(&ApiError {
                    error: format!("Error while fetching beatmap: {}", err),
                }),
                StatusCode::INTERNAL_SERVER_ERROR,
            ));
        }
    };

    let beatmapset = match beatmap.mapset {
        Some(s) => s,
        None => {
            eprintln!("Couldn't get beatmapset from beatmap (wtf?)");
            return Ok(reply::with_status(
                reply::json(&ApiError {
                    error: format!("Couldn't get beatmapset from beatmap (wtf?)"),
                }),
                StatusCode::INTERNAL_SERVER_ERROR,
            ));
        }
    };

    let should_download = matches!(
        beatmap.status,
        RankStatus::Graveyard | RankStatus::WIP | RankStatus::Pending
    );

    let map_file = if should_download {
        match download_beatmap(beatmap_id).await {
            Ok(bytes) => match String::from_utf8(bytes.to_vec()) {
                Ok(string) => string,
                Err(err) => {
                    eprintln!("Error while converting bytes to string: {}", err);
                    return Ok(reply::with_status(
                        reply::json(&ApiError {
                            error: format!("Error while converting bytes to string: {}", err),
                        }),
                        StatusCode::INTERNAL_SERVER_ERROR,
                    ));
                }
            },
            Err(err) => {
                eprintln!("Error while downloading beatmap: {}", err);
                return Ok(reply::with_status(
                    reply::json(&ApiError {
                        error: format!("Error while downloading beatmap: {}", err),
                    }),
                    StatusCode::INTERNAL_SERVER_ERROR,
                ));
            }
        }
    } else {
        match File::open(format!("maps/{}.osu", beatmap_id)) {
            Ok(mut file) => {
                let mut data_buf = String::new();

                if let Err(why) = file.read_to_string(&mut data_buf) {
                    eprintln!("Error while reading file: {}", why);
                    return Ok(reply::with_status(
                        reply::json(&ApiError {
                            error: format!("Error while reading file: {}", why),
                        }),
                        StatusCode::INTERNAL_SERVER_ERROR,
                    ));
                }

                data_buf
            }
            Err(err) => match err.kind() {
                ErrorKind::NotFound => match download_beatmap(beatmap_id).await {
                    Ok(bytes) => match String::from_utf8(bytes.to_vec()) {
                        Ok(string) => string,
                        Err(err) => {
                            eprintln!("Error while converting bytes to string: {}", err);
                            return Ok(reply::with_status(
                                reply::json(&ApiError {
                                    error: format!(
                                        "Error while converting bytes to string: {}",
                                        err
                                    ),
                                }),
                                StatusCode::INTERNAL_SERVER_ERROR,
                            ));
                        }
                    },
                    Err(err) => {
                        eprintln!("Error while downloading beatmap: {}", err);
                        return Ok(reply::with_status(
                            reply::json(&ApiError {
                                error: format!("Error while downloading beatmap: {}", err),
                            }),
                            StatusCode::INTERNAL_SERVER_ERROR,
                        ));
                    }
                },

                _ => {
                    eprintln!("Internal server error: {}", err);
                    return Ok(reply::with_status(
                        reply::json(&ApiError {
                            error: format!("Internal server error: {}", err),
                        }),
                        StatusCode::INTERNAL_SERVER_ERROR,
                    ));
                }
            },
        }
    };

    let map_calculate = match Beatmap::from_str(&map_file) {
        Ok(map) => map,
        Err(err) => {
            eprintln!("Error parsing beatmap: {}", err);
            return Ok(reply::with_status(
                reply::json(&ApiError {
                    error: format!("Error parsing beatmap: {}", err),
                }),
                StatusCode::INTERNAL_SERVER_ERROR,
            ));
        }
    };

    let diff_attrs = Difficulty::new().calculate(&map_calculate);

    let perf_attrs = rosu_pp::Performance::new(diff_attrs).calculate();

    let statistics = Statistics {
        ar: map_calculate.ar,
        od: map_calculate.od,
        cs: map_calculate.cs,
        hp: map_calculate.hp,
        bpm: map_calculate.bpm(),
        star_rating: perf_attrs.stars(),
    };

    Ok(reply::with_status(
        reply::json(&DetailsResult {
            title: beatmapset.title,
            artist: beatmapset.artist,
            creator: beatmapset.creator_name.to_string(),
            version: beatmap.version,
            set_id: beatmapset.mapset_id,
            statistics,
        }),
        StatusCode::OK,
    ))
}

#[derive(Serialize)]
struct AnalysisResult {
    analysis_type: String,
    analysis: Value,
}

pub async fn analyze_beatmap(
    beatmap_id: u32,
    analyze_type: String,
) -> Result<impl Reply, Rejection> {
    let path = Path::new("maps").join(format!("{}.osu", beatmap_id));
    let map = rosu_map::from_path::<rosu_map::Beatmap>(path).unwrap();

    match analyze_type.to_lowercase().as_str() {
        "all" => {
            let mut stream_analyzer = analyze::Stream::new(map.clone());
            let stream_analysis = stream_analyzer.analyze();

            let mut jump_analyzer = analyze::Jump::new(map);
            let jump_analysis = jump_analyzer.analyze();

            Ok(reply::with_status(
                reply::json(&vec![
                    AnalysisResult {
                        analysis_type: String::from("jump"),
                        analysis: serde_json::to_value(jump_analysis).unwrap(),
                    },
                    AnalysisResult {
                        analysis_type: String::from("stream"),
                        analysis: serde_json::to_value(stream_analysis).unwrap(),
                    },
                ]),
                StatusCode::OK,
            ))
        }

        "stream" => {
            let mut stream_analyzer = analyze::Stream::new(map);
            let analysis = stream_analyzer.analyze();

            Ok(reply::with_status(
                reply::json(&AnalysisResult {
                    analysis_type: String::from("stream"),
                    analysis: serde_json::to_value(analysis).unwrap(),
                }),
                StatusCode::OK,
            ))
        }

        "jump" => {
            let mut jump_analyzer = analyze::Jump::new(map);
            let analysis = jump_analyzer.analyze();

            Ok(reply::with_status(
                reply::json(&AnalysisResult {
                    analysis_type: String::from("jump"),
                    analysis: serde_json::to_value(analysis).unwrap(),
                }),
                StatusCode::OK,
            ))
        }

        _ => {
            // Handle cases where `analyze_type` is not desired type.
            return Ok(reply::with_status(
                reply::json(&ApiError {
                    error: "Bad request: `analyze_type` must be either: `stream`, `jump`, `all`."
                        .to_string(),
                }),
                StatusCode::BAD_REQUEST,
            ));
        }
    }
}
