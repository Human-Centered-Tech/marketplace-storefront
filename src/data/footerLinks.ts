const links = {
  marketplace: [
    { label: "Our Story", path: "/about" },
    // Vendor dashboard login (a separate app). Env-based so it's correct per
    // environment; rendered as an external <a> by the footer's FooterLink.
    {
      label: "Merchant Portal",
      path: `${process.env.NEXT_PUBLIC_VENDOR_URL || "http://localhost:5173"}/login`,
    },
    { label: "Marketplace", path: "/categories" },
  ],
  forBusinesses: [
    { label: "Sell on the Marketplace", path: "/sell" },
  ],
  discover: [
    { label: "Shop", path: "/categories" },
    { label: "Directory", path: "/directory" },
    { label: "Events", path: "/networking" },
    { label: "Trade", path: "/trade" },
  ],
  legal: [
    { label: "Privacy Policy", path: "/privacy" },
    { label: "Terms of Service", path: "/terms" },
    { label: "Merchant Terms", path: "/merchant-terms" },
  ],
  connect: [
    { label: "Contact Us", path: "mailto:support@catholicowned.com" },
    { label: "Events", path: "/networking" },
  ],
}

export default links
