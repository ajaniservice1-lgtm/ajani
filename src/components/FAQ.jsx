import React, { useState } from "react";

const FAQ = () => {
  const faqs = [
    {
      q: "How does Ajani work?",
      a: "Ajani is your AI guide to Ibadan. Just ask me anything about prices, places, or recommendations on WhatsApp, and I'll provide personalized answers based on verified data from our community.",
    },
    {
      q: "Are the prices verified?",
      a: 'Yes! Ajani\'s team verifies prices regularly. We show a "Last verified" date for each recommendation and highlight recently updated information to ensure accuracy.',
    },
    {
      q: "How often is data updated?",
      a: "Our database updates in real-time as vendors and our team submit new information. Community contributions are reviewed daily to ensure accuracy.",
    },
    {
      q: "Is Ajani free to use?",
      a: "Yes! Ajani is completely free for users. Businesses pay only for featured listings and advertising space, which helps us maintain and improve the service.",
    },
    {
      q: "How can I list my business on Ajani?",
      a: 'You can submit your business information through our "For Business Owners" form. Ajani will learn about your business and recommend you to relevant customers automatically.',
    },
    {
      q: "How can I report incorrect information?",
      a: "Use the WhatsApp chat to report any issues. We appreciate community feedback to keep Ajani accurate and helpful for everyone.",
    },
  ];

  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="max-w-7xl mx-auto px-5 py-12 font-rubik">
      <h2 className="text-3xl font-bold mb-2">Frequently Asked Questions</h2>
      <p className="text-slate-600 mb-8">
        Everything you need to know about using Ajani
      </p>

      <div className="space-y-4">
        {faqs.map((faq, i) => (
          <div
            key={i}
            className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition"
          >
            <button
              onClick={() => toggle(i)}
              className="w-full px-6 py-5 text-left flex justify-between items-center focus:outline-none"
              aria-expanded={openIndex === i}
            >
              <h4 className="font-bold text-lg text-slate-900">{faq.q}</h4>
              <i
                className={`fas fa-chevron-down text-slate-500 transform transition-transform ${
                  openIndex === i ? "rotate-180" : ""
                }`}
              ></i>
            </button>

            <div
              className={`px-6 pb-5 text-slate-600 overflow-hidden transition-all duration-300 ease-in-out ${
                openIndex === i ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <p>{faq.a}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FAQ;
