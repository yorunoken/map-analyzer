import Link from "next/link";

export default function Footer() {
    return (
        <footer className="mt-auto border-t lg:container mx-auto">
            <div className="py-6 flex flex-col items-center space-y-2 sm:space-y-0 sm:flex-row sm:justify-between">
                <span className="font-bold text-sm text-center sm:text-left">
                    © 2024 osu! map analyzer. All rights reserved.
                </span>
                <div className="flex flex-wrap justify-center sm:justify-end items-center gap-4 text-sm">
                    <Link
                        href="https://yorunoken.com/support"
                        className="hover:underline font-bold animate-color-change"
                        target="_blank"
                        prefetch={false}
                    >
                        Support me!
                    </Link>
                    <Link
                        href="https://yorunoken.com"
                        className="hover:underline"
                        target="_blank"
                        prefetch={false}
                    >
                        Contact
                    </Link>
                    <Link
                        href="https://github.com/yorunoken/map-analyzer"
                        target="_blank"
                        className="hover:underline"
                        prefetch={false}
                    >
                        GitHub
                    </Link>
                </div>
            </div>
        </footer>
    );
}
