import Link from "next/link";

export default function FooterComponent() {
  return (
    <div className="mx-auto mt-3 grid w-11/12 grid-cols-6 items-center justify-items-center border-t border-black py-5 font-poppins text-xs sm:text-sm md:flex md:grid-cols-6 md:justify-between md:justify-evenly lg:mt-6">
      <Link
        href={"/terms"}
        className="col-span-1 px-1 hover:underline md:col-span-1"
      >
        Terms of Service
      </Link>
      <div className="col-span-4 flex flex-col md:col-span-4 md:flex-row">
        <p className="pl-1">&copy; 2025 E-Learning App</p>
        <p></p>
      </div>

      <Link
        href={"/privacy"}
        className="col-span-1 px-1 hover:underline md:col-span-1"
      >
        Privacy Policy
      </Link>
    </div>
  );
}
