import Link from "next/link";

export default function Header() {
    return (
        <header className="container flex justify-center mx-auto p-4 border-b">
            <Link className="text-3xl font-bold" href="/">
                osu! beatmap analyzer
            </Link>
        </header>
    );
}
