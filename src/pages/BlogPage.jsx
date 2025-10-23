// src/pages/BlogPage.jsx
import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const BlogPage = () => {
  // Sample random informational posts
  const posts = [
    {
      id: 1,
      title: "Why Clean Code Matters",
      excerpt:
        "Writing clean, readable code isn’t just about aesthetics—it saves hours in debugging and onboarding.",
      date: "Oct 10, 2025",
    },
    {
      id: 2,
      title: "The Power of User-Centric Design",
      excerpt:
        "Great UX starts with empathy. Always design for real user needs, not assumptions.",
      date: "Oct 5, 2025",
    },
    {
      id: 3,
      title: "Frontend Tips: Optimize Your Bundle",
      excerpt:
        "Small tweaks like code splitting and lazy loading can drastically improve load times.",
      date: "Sep 28, 2025",
    },
    {
      id: 4,
      title: "How We Use Google Sheets for Live Data",
      excerpt:
        "Connecting spreadsheets to web apps enables non-technical teams to update content in real time.",
      date: "Sep 20, 2025",
    },
  ];

  return (
    <>
      {" "}
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8 font-rubik">
        <Header />
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header Card */}
          <div className="bg-gray-900 text-white rounded-t-lg p-8 shadow-md text-center">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight ">
              Insights & Ideas
            </h1>
            <p className="mt-2 text-blue-100">
              Random thoughts, tips, and learnings from the field.
            </p>
          </div>

          {/* Content Card */}
          <div className="bg-white rounded-b-lg shadow-md p-8 border-t border-gray-200">
            {/* Blog Posts */}
            <div className="space-y-8">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="p-6 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">
                      {post.title}
                    </h2>
                    <span className="text-sm text-gray-500">{post.date}</span>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    {post.excerpt}
                  </p>
                </article>
              ))}
            </div>

            {/* Footer Note */}
            <footer className="mt-12 pt-6 border-t border-gray-200 text-center text-gray-500 text-sm">
              <p>More posts coming soon. Stay curious!</p>
            </footer>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default BlogPage;
