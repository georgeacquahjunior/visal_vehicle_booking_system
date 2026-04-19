import React from "react";
import { Link } from "react-router-dom";
import changelogData from "../utils/changelogData";

export default function Changelog() {
  const badgeStyles = {
    added: "bg-green-100 text-green-700",
    fixed: "bg-blue-100 text-blue-700",
    improved: "bg-yellow-100 text-yellow-700",
    breaking: "bg-red-100 text-red-700",
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="font-bold text-lg tracking-tight">
              VehicleSys
            </Link>

            <Link to="/" className="text-sm text-gray-500 hover:text-black">
              ← Back to Home
            </Link>
          </div>

          <div className="text-sm text-gray-400">v1 Updates</div>
        </div>
      </nav>

      {/* MAIN */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* HEADER */}
        <header className="mb-16">
          <h1 className="text-5xl font-extrabold tracking-tight">
            Changelog
          </h1>
          <p className="text-gray-500 mt-3">
            Track product improvements, fixes, and new features.
          </p>
        </header>

        {/* TIMELINE */}
        <div className="relative">
          <div className="absolute left-2 top-0 bottom-0 w-[2px] bg-gray-200"></div>

          <div className="space-y-14">
            {changelogData.map((group, idx) => (
              <div key={idx} className="relative pl-10">
                {/* DOT */}
                <div className="absolute left-0 top-2 w-4 h-4 bg-black rounded-full"></div>

                {/* VERSION */}
                <div className="mb-6">
                  <h2 className="text-lg font-semibold">
                    {group.version}
                    <span className="ml-3 text-sm text-gray-400 font-normal">
                      {group.date}
                    </span>
                  </h2>
                </div>

                {/* ITEMS */}
                <div className="space-y-6">
                  {group.items.map((item, i) => (
                    <div
                      key={i}
                      className="bg-white border rounded-2xl p-5 hover:shadow-md transition space-y-4"
                    >
                      {/* TOP */}
                      <div className="flex gap-5">
                        {/* IMAGE */}
                        <div className="w-28 h-20 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* CONTENT */}
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-3 mb-1">
                            <h3 className="font-semibold text-lg">
                              {item.title}
                            </h3>

                            {/* TYPE BADGE */}
                            <span
                              className={`text-xs px-2 py-1 rounded-full font-medium ${
                                badgeStyles[item.type]
                              }`}
                            >
                              {item.type}
                            </span>
                          </div>

                          <p className="text-gray-600 text-sm leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </div>

                      {/* META ROW */}
                      <div className="flex flex-wrap gap-2 text-[11px]">
                        {item.audience && (
                          <span className="px-2 py-1 bg-gray-100 rounded-full">
                            🎯 {item.audience}
                          </span>
                        )}

                        {item.impact && (
                          <span className="px-2 py-1 bg-gray-100 rounded-full">
                            ⚡ {item.impact}
                          </span>
                        )}

                        {item.status && (
                          <span className="px-2 py-1 bg-gray-100 rounded-full">
                            🚀 {item.status}
                          </span>
                        )}

                        {item.metrics && (
                          <span className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-full">
                            📈 {item.metrics}
                          </span>
                        )}
                      </div>

                      {/* TAGS */}
                      {item.tags && (
                        <div className="flex flex-wrap gap-2 text-[10px]">
                          {item.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 border rounded-full text-gray-500"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* FOOTER */}
                      <div className="flex justify-between items-center text-xs text-gray-400">
                        <div>
                          {item.author && <span>🧑 {item.author}</span>}
                        </div>
                        <div>
                          {item.timestamp && <span>{item.timestamp}</span>}
                        </div>
                      </div>

                      {/* ACTION */}
                      {item.action && (
                        <div className="text-sm font-medium text-indigo-600">
                          {item.action}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FOOTER */}
        <div className="mt-20 text-center">
          <button className="text-sm font-medium text-gray-600 hover:text-black">
            View older updates →
          </button>
        </div>
      </main>
    </div>
  );
}