interface BeatmapSetURL {
    url: string;
    setId: string;
    gameMode: string | null;
    difficultyId: string | null;
}

interface BeatmapURL {
    url: string;
    id: string;
}

const init = "https://osu.ppy.sh/";
const index = init.length;
const beatmapsetsName = "beatmapsets";
const nameLength = beatmapsetsName.length;

export function parseURL(url: string): BeatmapSetURL | BeatmapURL | null {
    if (!url.startsWith(init)) return null;
    if (url[index] !== "b") return null;

    if (url[index + 1] === "/") {
        return {
            url,
            id: url.substring(index + 2),
        } satisfies BeatmapURL;
    }

    if (!url.startsWith(beatmapsetsName, index)) return null;
    const subUrl = url.substring(index + nameLength + 1);

    const slash = subUrl.indexOf("/");
    const hash = subUrl.indexOf("#");

    if (slash === -1) {
        if (hash === -1) {
            return {
                url,
                setId: subUrl,
                gameMode: null,
                difficultyId: null,
            } satisfies BeatmapSetURL;
        }

        return {
            url,
            setId: subUrl.substring(0, hash),
            gameMode: subUrl.substring(hash + 1),
            difficultyId: null,
        } satisfies BeatmapSetURL;
    }

    return {
        url,
        setId: subUrl.substring(0, hash),
        gameMode: subUrl.substring(hash + 1, slash),
        difficultyId: subUrl.substring(slash + 1),
    } satisfies BeatmapSetURL;
}
