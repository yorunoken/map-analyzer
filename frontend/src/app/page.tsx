import Analysis, {
    BeatmapAnalysisResult,
    BeatmapDetailsResult,
} from "@/components/analysis";
import { BACKEND_URL } from "@/lib";

export default function Main() {
    async function getBeatmapDetails(
        beatmapId: number,
    ): Promise<BeatmapDetailsResult> {
        "use server";

        const response = await fetch(
            `${BACKEND_URL}/api/beatmaps/${beatmapId}/details`,
        );
        console.log(`${BACKEND_URL}/api/${beatmapId}/details`);

        if (!response.ok) {
            throw new Error("Response not ok.");
        }

        return await response.json();
    }

    async function getBeatmapAnalysis(
        beatmapId: number,
        analysisType: "stream",
    ): Promise<BeatmapAnalysisResult> {
        "use server";

        const response = await fetch(
            `${BACKEND_URL}/api/beatmaps/${beatmapId}/analyze/${analysisType}`,
        );
        console.log(
            `${BACKEND_URL}/api/beatmaps/${beatmapId}/analyze/${analysisType}`,
        );

        if (!response.ok) {
            throw new Error("Response not ok.");
        }

        return await response.json();
    }

    return (
        <div className="container mx-auto p-4 max-w-3xl">
            <p className="font-semibold mb-2 text-center">
                Analyze beatmaps with the click of a button.
            </p>
            <Analysis
                getBeatmapAnalysis={getBeatmapAnalysis}
                getBeatmapDetails={getBeatmapDetails}
            />
        </div>
    );
}
