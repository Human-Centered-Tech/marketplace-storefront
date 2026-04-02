const steps = [
  {
    number: 1,
    title: "Sign Up",
    description:
      "Create your profile as a customer or vendor to join the ecosystem.",
  },
  {
    number: 2,
    title: "Find Businesses",
    description:
      "Browse verified vendors who share your faith and values.",
  },
  {
    number: 3,
    title: "Buy What You Need",
    description:
      "Shop securely and support the growth of the Catholic community.",
  },
]

export function ShopByStyleSection() {
  return (
    <section className="py-24 lg:py-32 w-full bg-[#faf9f5] px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 lg:mb-20 space-y-4">
          <span className="font-sans text-[11px] tracking-[0.2em] uppercase text-[#755b00] font-bold">
            Simplicity in Mission
          </span>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-[#001435] italic">
            How It Works
          </h2>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16 relative">
          {/* Connecting line (desktop only) */}
          <div className="hidden lg:block absolute top-12 left-[15%] right-[15%] h-[1px] bg-[#F2CD69]/30" />

          {steps.map((step) => (
            <div
              key={step.number}
              className="flex flex-col items-center text-center space-y-6 relative z-10"
            >
              {/* Gold numbered circle with white border ring */}
              <div className="w-24 h-24 rounded-full bg-[#F2CD69] text-[#001435] flex items-center justify-center text-3xl font-serif font-bold shadow-xl border-8 border-[#faf9f5]">
                {step.number}
              </div>
              <div className="space-y-2">
                <h3 className="font-serif text-2xl font-bold text-[#001435]">
                  {step.title}
                </h3>
                <p className="text-[#75777f] max-w-xs mx-auto text-[15px] leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
