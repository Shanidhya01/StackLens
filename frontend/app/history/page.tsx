"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import HistoryList from "@/components/HistoryList";
import { useAuth } from "@/context/AuthContext";
import { fetchHistory } from "@/lib/api";

interface HistoryItem {
	_id: string;
	url: string;
	scannedAt: string;
	framework?: string;
	hosting?: string;
	renderMode?: string;
	score?: number;
	userId?: string;
}

interface ApiScan {
	_id?: string;
	url?: string;
	scannedAt?: string;
	framework?: string;
	hosting?: string;
	renderMode?: string;
	userId?: string;
	report?: {
		summary?: string;
		overallScore?: number;
	};
	raw?: {
		detection?: {
			framework?: string;
			hosting?: string;
			rendering?: string;
		};
	};
}

function parseSummary(summary?: string): Pick<HistoryItem, "framework" | "hosting" | "renderMode"> {
	if (!summary) return {};
	const match = summary.match(/use\s(.+?),\shosted\son\s(.+?),\sfollowing\s(.+?)\./i);
	if (!match) return {};
	return {
		framework: match[1],
		hosting: match[2],
		renderMode: match[3],
	};
}

export default function HistoryPage() {
	const { user, loading } = useAuth();
	const [history, setHistory] = useState<HistoryItem[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		const loadHistory = async () => {
			if (loading) return;
			if (!user) {
				setHistory([]);
				setIsLoading(false);
				return;
			}

			setIsLoading(true);
			setError("");

			try {
				const scans = await fetchHistory(user.uid);
				const mapped: HistoryItem[] = (Array.isArray(scans) ? scans : [])
					.map((scan: ApiScan) => {
						const fromSummary = parseSummary(scan?.report?.summary);
						const detection = scan?.raw?.detection || {};

						return {
							_id: scan?._id ?? "",
							url: scan?.url ?? "",
							scannedAt: scan?.scannedAt ?? new Date().toISOString(),
							framework: detection.framework || scan?.framework || fromSummary.framework,
							hosting: detection.hosting || scan?.hosting || fromSummary.hosting,
							renderMode: detection.rendering || scan?.renderMode || fromSummary.renderMode,
							score: scan?.report?.overallScore,
							userId: scan?.userId,
						};
					})
					.filter((scan) => Boolean(scan._id && scan.url));

				setHistory(mapped);
			} catch {
				setError("Failed to fetch your scan history.");
			} finally {
				setIsLoading(false);
			}
		};

		loadHistory();
	}, [loading, user]);

	const title = useMemo(() => {
		if (!user?.displayName) return "Your Previous Scans";
		const firstName = user.displayName.split(" ")[0];
		return `${firstName}'s Previous Scans`;
	}, [user]);

	return (
		<main className="min-h-screen px-6 py-10 max-w-6xl mx-auto">
			<div className="mb-8">
				<p className="text-xs tracking-[0.2em] text-white/40 mb-2">HISTORY</p>
				<h1 className="text-3xl font-bold text-white mb-1">{title}</h1>
				<p className="text-sm text-white/50">See your past analysis results and tech fingerprint snapshots.</p>
			</div>

			{!loading && !user && (
				<div className="rounded-xl border border-white/10 bg-white/3 p-6">
					<p className="text-sm text-white/70 mb-4">Sign in to view your previous scans.</p>
					<Link
						href="/login"
						className="inline-flex px-5 py-2 rounded-md text-sm font-semibold bg-emerald-400 text-emerald-950 hover:bg-emerald-300 transition-colors"
					>
						Sign in →
					</Link>
				</div>
			)}

			{(loading || isLoading) && user && (
				<div className="rounded-xl border border-white/10 bg-white/3 p-6 text-sm text-white/60">
					Loading previous scans...
				</div>
			)}

			{!isLoading && error && user && (
				<div className="rounded-xl border border-red-400/25 bg-red-400/10 p-4 text-sm text-red-200">
					{error}
				</div>
			)}

			{!isLoading && !error && user && <HistoryList history={history} />}
		</main>
	);
}
