mod api;
mod models;
mod routes;
mod utils;

use dotenvy::from_filename;
use std::{env, sync::Arc};

#[tokio::main]
async fn main() {
    // Load environment variables
    from_filename(".env.local").ok();

    let osu_client_id: u64 = env::var("OSU_CLIENT_ID")
        .expect("Expected OSU_CLIENT_ID to be defined in environment.")
        .parse()
        .expect("OSU_CLIENT_ID is not a number!");

    let osu_client_secret = env::var("OSU_CLIENT_SECRET")
        .expect("Expected OSU_CLIENT_SECRET to be defined in environment.");

    let osu_client = Arc::new(
        rosu_v2::Osu::new(osu_client_id, osu_client_secret)
            .await
            .unwrap(),
    );

    let api = routes::routes(osu_client);

    let port: u16 = env::var("PORT")
        .expect("Expected PORT to be defined in environment.")
        .parse()
        .expect("PORT is not a number!");

    println!("Server started at http://127.0.0.1:{port}");
    warp::serve(api).run(([127, 0, 0, 1], port)).await;
}
