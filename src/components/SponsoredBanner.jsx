import React from "react";

const SponsoredBanner = () => {
  return (
    <section className="py-8 bg-gradient-to-r from-amber-50 to-orange-50 border-y border-amber-200 font-rubik">
      <div className="max-w-7xl mx-auto px-5 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <span className="inline-block bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded mb-2">
            Sponsored
          </span>
          <h3 className="text-xl font-bold">Promote Your Business Here</h3>
          <p className="text-slate-700">
            Reach thousands of Ibadan residents looking for local services
          </p>
        </div>
        <a
          href="#vendors"
          className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-semibold"
        >
          Learn More
        </a>
      </div>
    </section>
  );
};

export default SponsoredBanner;
