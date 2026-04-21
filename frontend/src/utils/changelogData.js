// src/data/changelogData.js

const changelogData = [
  {
    version: "v1.3.0",
    date: "October 2026",
    items: [
      {
        title: "Multi-vehicle booking",
        description:
          "Users can now book multiple vehicles in one transaction for corporate accounts.",
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuBdrPWE0L3Zp8eO9fkGNgMbdviDoW7yd3jjZl6wvU9N9iLmbbQ2oUUrVh86WJpEqAbrMlWfVzarkLrXvxokws2GZ5Zj34lpsfuuMu3EfaWDn4fFi_IznHydrrDxJp8A1s02VjFySL--xeUnjqFmMTCRrPa06UvCP10DH1WDMELzWTJK3GhwrppiCxyXxODZHZPgybC7G6xKsdeK84KherBfJoMmWwvY3DoZ4Cx20-Xs3JKlRwFKhi5OodUE35wKRTFXteVxEGFuyuRN",
        type: "added",

        impact: "high",
        audience: "Corporate",
        status: "live",
        tags: ["booking", "fleet"],
        metrics: "40% faster bulk booking",
        action: "No action needed",
        author: "Backend Team",
        timestamp: "Oct 12, 2026",
      },
      {
        title: "Payment gateway timeout",
        description:
          "Resolved credit card transaction hangs during peak traffic for Stripe and PayPal.",
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuDd4IZGc0CbVrIz7CC6tw_tUGD_keX4UsS72cJ40IqakduRyiY8-xLULRSRxSayg5Emfxuu1r7iFDNtVIfuJSHznDWavxpzQbZueWks1sJVstHKEcyZwwaC8B2L55_xCXMUrhFBngA96cCDZQM5poYPpl7stXk039v89uoIvaHn4FqpXIjj8LZ9RyiDH9W7acrplhPNSpacl8_PBvtMT1nSvK07gkjJ5qbVgbD8ubFetkJbt45H9PHzt40_giAxYyadICWZFKjfMZQd",
        type: "fixed",

        impact: "high",
        audience: "All Users",
        status: "live",
        tags: ["payments", "bugfix"],
        metrics: "Eliminated timeout errors",
        action: "No action needed",
        author: "Payments Team",
        timestamp: "Oct 10, 2026",
      },
    ],
  },
  {
    version: "v1.2.5",
    date: "September 2026",
    items: [
      {
        title: "Fleet management UI",
        description:
          "Refined dashboard view with real-time availability badges for faster processing.",
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuBSmHngyBcGmoCy2EU4ztR8joX2HGew33QLTbKUyWKYhyo8CABZOXPpcP3b2S1GYRoEgkPufhxaIf7S3x1Txkqejlbcl71i3v-COfBubpIrvTZlgVTYBnQcv_ZD_DZJn5ISe21g4Xk1l3iw-YzPBRagjwr3ljbqhJeVtZmIiZrGgmSXpSVsbt6Ar3EZG3xW5wuYYjpWY2CQ84hgMUVLvkecM2eAeTFJoYQ84xmlQCNUaRRIH21HikgPM6_6ZxhULKv1wOcv0b0Fr3Ex",
        type: "added",

        impact: "medium",
        audience: "Admins",
        status: "live",
        tags: ["dashboard", "fleet"],
        metrics: "Improved processing speed",
        action: "No action needed",
        author: "Frontend Team",
        timestamp: "Sep 28, 2026",
      },
    ],
  },
];

export default changelogData;