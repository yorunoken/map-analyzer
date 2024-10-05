# osu! beatmap analyzer

osu! beatmap analyzer is a website that analyzes osu! beatmaps and categorizes them based on their characteristics.

It uses [an analyzer library I wrote in Rust](https://github.com/yorunoken/osu-map-analyzer-lib) to calculate its values.

## Features

- Analyze osu! beatmaps by URL
- Put maps into categories: Stream, Jump, Tech, and Slider
- Provide detailed analysis for each category
- Display beatmap information and statistics

## Setup

1. Clone the repository

2. Set up the backend:
   - Navigate to the `backend` directory
   - Copy `.env.example` to `.env.local` and fill in the required values
   - Run `cargo run` to start the backend server

3. Set up the frontend:
   - Navigate to the `frontend` directory
   - Copy `.env.example` to `.env.local` and ensure the `BACKEND_PORT` matches the backend's port
   - Run `bun install` to install dependencies
   - Run `bun run dev` to start the development server

4. Run both at once:
    - You can run both backend and frontend and once with `bun run dev` at the root of the project.

## Contributing

This project is essentially in beta. If you come across and issues or have suggestions for improvements,
please open an issue or a pull request.

## Planned Features

- Implement more categories (Tech and Slider maps)
- Improve detection algorithms
- Add visulizations of where the category has peaked the most
- Add sorting maps by category
