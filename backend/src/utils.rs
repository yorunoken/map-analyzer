use std::fs::File;
use std::io::Write;
use warp::hyper::body::Bytes;

use reqwest::Client;

pub async fn download_beatmap(beatmap_id: u32) -> Result<Bytes, Box<dyn std::error::Error>> {
    let client = Client::new();
    let url = format!("https://osu.ppy.sh/osu/{}", beatmap_id);

    let response = client.get(&url).send().await?;

    if response.status().is_success() {
        let bytes = response.bytes().await?;

        let mut file = File::create(format!("maps/{}.osu", beatmap_id))?;
        file.write_all(&bytes)?;

        println!("Beatmap {} downloaded successfully.", beatmap_id);
        Ok(bytes)
    } else {
        Err(format!("Failed to download beatmap. Status: {}", response.status()).into())
    }
}
