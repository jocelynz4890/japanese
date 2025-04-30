import Link from "next/link";

function Header(){
    return (
        <header className="sticky top-0 flex items-center justify-between px-6 py-3 shadow-md h-16">
            <nav className="flex space-x-6">
                <Link href="/" className="hover:text-gray-300 transition">
                    Home
                </Link>
                <Link href="/progress" className="hover:text-gray-300 transition">
                    Progress
                </Link>
                {/* TODO: global settings */}
                {/* TODO: login/profile */}
            </nav>
        </header>
    )
}

export default Header