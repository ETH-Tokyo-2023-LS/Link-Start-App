import Image from "next/image";
import Link from "next/link";

type MobileHeaderProps = {
  title?: string;
};
export const MobileHeader: React.FC<MobileHeaderProps> = ({ title }) => {
  return (
    <header className="w-full flex items-center justify-center bg-white shadow-md h-14">
      {/* <Link
        href="/"
        className="text-blue-500 hover:text-blue-700 transition-colors duration-200"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3"
          />
        </svg>
      </Link> */}
      <Image
        src="/linkstart_logo2.png"
        alt="linkstart"
        height={60}
        width={180}
      />
      {/* <h1 className="text-2xl font-semibold text-gray-800">{title}</h1> */}
      {/* <div className="w-6" /> */}
      {/* このdivは右側のスペースを確保するために使用 */}
    </header>
  );
};
