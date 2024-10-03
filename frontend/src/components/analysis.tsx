"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

import { useState } from "react";
import { BarChart, Music } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { parseURL } from "@/lib/osu";

export interface BeatmapDetailsResult {
    title: string;
    artist: string;
    creator: string;
    version: string;
    set_id: number;
    statistics: {
        ar: number;
        od: number;
        hp: number;
        cs: number;
        bpm: number;
        star_rating: number;
    };
}

export interface BeatmapAnalysisResult {
    analysis_type: string;
    analysis: AnalysisStream;
}

interface AnalysisStream {
    overall_confidence: number;
    short_streams: number;
    medium_streams: number;
    long_streams: number;
    max_stream_length: number;
}

type AnalysisProps = {
    getBeatmapDetails(beatmapId: number): Promise<BeatmapDetailsResult>;
    getBeatmapAnalysis(
        beatmapId: number,
        analysisType: "stream",
    ): Promise<BeatmapAnalysisResult>;
};

export default function Analysis({
    getBeatmapAnalysis,
    getBeatmapDetails,
}: AnalysisProps) {
    const [beatmapUrl, setBeatmapUrl] = useState("");
    const [beatmapSetId, setBeatmapSetId] = useState(0);
    const [beatmapId, setBeatmapId] = useState(0);

    const [analysisResult, setAnalysisResult] =
        useState<BeatmapAnalysisResult | null>(null);
    const [detailsResult, setDetailsResult] =
        useState<BeatmapDetailsResult | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        const urlMatch = parseURL(beatmapUrl);

        let beatmapId: string | null = null;

        if (urlMatch && "id" in urlMatch) beatmapId = urlMatch.id;
        else if (urlMatch && "setId" in urlMatch)
            beatmapId = urlMatch.difficultyId;

        if (beatmapId === null) {
            return;
        }

        const mapDetails = await getBeatmapDetails(+beatmapId);
        const mapAnalysis = await getBeatmapAnalysis(+beatmapId, "stream");

        setBeatmapSetId(mapDetails.set_id);
        setBeatmapId(+beatmapId);
        setDetailsResult(mapDetails);
        setAnalysisResult(mapAnalysis);
    }

    return (
        <>
            <form onSubmit={handleSubmit} className="mb-8">
                <div className="flex gap-2">
                    <Input
                        type="text"
                        value={beatmapUrl}
                        onChange={(e) => setBeatmapUrl(e.target.value)}
                        placeholder="Enter beatmap ID or URL"
                        className="flex-grow"
                    />
                    <Button type="submit">Analyze</Button>
                </div>
            </form>

            {analysisResult && detailsResult && (
                <div>
                    <div className="relative mb-6 overflow-hidden rounded-lg">
                        <Image
                            alt="beatmap cover"
                            width={1200}
                            height={675}
                            src={`https://assets.ppy.sh/beatmaps/${beatmapSetId}/covers/cover.jpg`}
                            className="w-full h-auto"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm"></div>
                        <div className="absolute inset-0 flex flex-col justify-center items-center text-white p-4">
                            <h2 className="text-3xl font-bold mb-2">
                                <Link
                                    href={`https://osu.ppy.sh/b/${beatmapId}`}
                                    className="underline text-pink-100"
                                    target="_blank"
                                >
                                    {detailsResult.title}
                                </Link>
                            </h2>
                            <p className="text-xl mb-1">
                                by{" "}
                                <Link
                                    href={`https://osu.ppy.sh/beatmapsets?q=artist=""${detailsResult.artist}""`}
                                    className="hover:underline text-pink-300"
                                    target="_blank"
                                >
                                    {detailsResult.artist}
                                </Link>
                            </p>
                            <p className="text-lg">
                                mapped by{" "}
                                <Link
                                    href={`https://osu.ppy.sh/users/${detailsResult.creator}`}
                                    className="hover:underline text-pink-200"
                                    target="_blank"
                                >
                                    {detailsResult.creator}
                                </Link>
                            </p>
                            <p className="text-lg">{detailsResult.version}</p>
                        </div>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BarChart className="w-5 h-5" />
                                    Beatmap Stats
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="flex flex-row">
                                        <span className="font-semibold mr-1">
                                            AR:
                                        </span>
                                        <span>
                                            {detailsResult.statistics.ar}
                                        </span>
                                    </div>
                                    <div className="flex flex-row">
                                        <span className="font-semibold mr-1">
                                            OD:
                                        </span>
                                        <span>
                                            {detailsResult.statistics.od}
                                        </span>
                                    </div>
                                    <div className="flex flex-row">
                                        <span className="font-semibold mr-1">
                                            HP:
                                        </span>
                                        <span>
                                            {detailsResult.statistics.hp}
                                        </span>
                                    </div>
                                    <div className="flex flex-row">
                                        <span className="font-semibold mr-1">
                                            CS:
                                        </span>
                                        <span>
                                            {detailsResult.statistics.cs}
                                        </span>
                                    </div>
                                    <div className="flex flex-row">
                                        <span className="font-semibold mr-1">
                                            BPM:
                                        </span>
                                        <span>
                                            {detailsResult.statistics.bpm.toFixed()}
                                        </span>
                                    </div>
                                    <div className="col-span-2 flex flex-row">
                                        <span className="font-semibold mr-1">
                                            Star Rating:
                                        </span>
                                        <span>
                                            {detailsResult.statistics.star_rating.toFixed(
                                                2,
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Music className="w-5 h-5" />
                                    Classification
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="mb-4">
                                    <h3 className="font-semibold">
                                        Primary:{" "}
                                        {analysisResult.analysis_type
                                            .charAt(0)
                                            .toUpperCase()}
                                        {analysisResult.analysis_type.slice(1)}
                                    </h3>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-2">
                                        <div
                                            className="bg-primary h-2.5 rounded-full"
                                            style={{
                                                width: `${analysisResult.analysis.overall_confidence * 100}%`,
                                            }}
                                        ></div>
                                    </div>
                                    <p className="text-sm mt-1">
                                        Confidence:{" "}
                                        {(
                                            analysisResult.analysis
                                                .overall_confidence * 100
                                        ).toFixed(1)}
                                        %
                                    </p>
                                </div>
                                <div>
                                    <Accordion type="single" collapsible>
                                        <AccordionItem value="item-1">
                                            <AccordionTrigger className="font-semibold">
                                                Stream Details:
                                            </AccordionTrigger>
                                            <AccordionContent>
                                                <ul className="list-disc list-inside text-sm">
                                                    <li>
                                                        Longest stream:{" "}
                                                        {
                                                            analysisResult
                                                                .analysis
                                                                .max_stream_length
                                                        }{" "}
                                                        notes
                                                    </li>
                                                    <li>
                                                        Short streams:{" "}
                                                        {
                                                            analysisResult
                                                                .analysis
                                                                .short_streams
                                                        }
                                                    </li>
                                                    <li>
                                                        Medium streams:{" "}
                                                        {
                                                            analysisResult
                                                                .analysis
                                                                .medium_streams
                                                        }
                                                    </li>
                                                    <li>
                                                        Long streams:{" "}
                                                        {
                                                            analysisResult
                                                                .analysis
                                                                .long_streams
                                                        }
                                                    </li>
                                                </ul>
                                            </AccordionContent>
                                        </AccordionItem>
                                    </Accordion>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
        </>
    );
}
