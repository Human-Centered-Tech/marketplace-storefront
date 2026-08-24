import { SellerAvatar } from "@/components/cells/SellerAvatar/SellerAvatar"
import { StarRating } from "@/components/atoms"
import { Chat } from "@/components/organisms/Chat/Chat"
import { ShareButton } from "@/components/molecules/ShareButton/ShareButton"
import { HttpTypes } from "@medusajs/types"
import { SellerProps } from "@/types/seller"

export const SellerPageHeader = ({
  seller,
  user,
}: {
  header?: boolean
  seller: SellerProps
  user: HttpTypes.StoreCustomer | null
}) => {
  const reviews = seller.reviews?.filter((rev) => rev !== null) ?? []
  const reviewCount = reviews.length
  const rating =
    reviewCount > 0
      ? reviews.reduce((sum, r) => sum + (r?.rating || 0), 0) / reviewCount
      : 0

  return (
    <>
      {/* Hero Banner */}
      <header className="relative w-full overflow-hidden bg-[#f4f4f0]">
        <div className="h-[420px] md:h-[560px] lg:h-[640px] w-full relative">
          <img
            className="w-full h-full object-cover opacity-90"
            src={seller.cover_image_url || "/images/seller-banner-default.jpg"}
            alt={`${seller.name} storefront`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#001435]/60 to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-8 -mt-32 relative z-10 pb-12">
          <div className="bg-white p-10 rounded-xl shadow-[0_32px_32px_-4px_rgba(23,41,74,0.08)] flex flex-col md:flex-row items-center md:items-end gap-10">
            {/* Seller Avatar. White behind a real logo so transparent logos
                don't sit on navy (Matteo 7/7); the letter placeholder keeps the
                navy fill since its gold glyph needs a dark background. */}
            <div
              className={`w-40 h-40 rounded-xl flex items-center justify-center shadow-lg border-2 border-[#755b00]/20 overflow-hidden shrink-0 ${
                seller.photo ? "bg-white" : "bg-[#17294a]"
              }`}
            >
              {seller.photo ? (
                <SellerAvatar photo={seller.photo} size={160} alt={seller.name} />
              ) : (
                <span className="text-[#e7c360] text-6xl font-serif font-bold">
                  {seller.name?.charAt(0) || "?"}
                </span>
              )}
            </div>

            {/* Seller Info */}
            <div className="flex-grow text-center md:text-left">
              {/* Was a non-responsive text-5xl — 48px even on phones. Step up
                  with viewport instead (Brooke web-polish: storefront name). */}
              <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-[#001435] mb-3">
                {seller.name}
              </h1>
              {seller.description && (
                <p className="font-serif italic text-xl text-[#695e2a] mb-6 max-w-2xl">
                  {seller.description.replace(/<[^>]*>/g, "")}
                </p>
              )}

              {/* Stats Row */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-8 border-t border-[#755b00]/10 pt-6">
                {seller.products && (
                  <div className="flex flex-col">
                    <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-[#755b00] font-bold">
                      Products
                    </span>
                    <span className="text-2xl font-serif font-bold text-[#001435]">
                      {seller.products.length}
                    </span>
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-[#755b00] font-bold">
                    Reviews
                  </span>
                  <span className="text-2xl font-serif font-bold text-[#001435]">
                    {reviewCount > 1000
                      ? `${(reviewCount / 1000).toFixed(1)}k`
                      : reviewCount}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-[#755b00] font-bold">
                    Rating
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-2xl font-serif font-bold text-[#001435]">
                      {rating > 0 ? rating.toFixed(1) : "--"}
                    </span>
                    {rating > 0 && <StarRating starSize={14} rate={rating} />}
                  </div>
                </div>
              </div>
            </div>

            {/* Message Seller + Share. Share renders for every viewer —
                unlike Chat it doesn't need an account (Brooke 8/11). */}
            <div className="shrink-0 flex items-center gap-3">
              {user && (
                <Chat
                  user={user}
                  seller={seller}
                  icon
                  buttonClassNames="bg-[#001435] text-white px-8 py-4 rounded-xl font-sans font-bold flex items-center gap-3 border-2 border-transparent hover:bg-transparent hover:text-[#001435] hover:border-[#755b00] transition-all duration-500 shadow-lg text-sm uppercase tracking-wider"
                />
              )}
              <ShareButton
                title={seller.name}
                text={`${seller.name} on Catholic Owned`}
                entityType="seller"
                entityId={seller.id}
                className="relative p-4 rounded-xl bg-[#f4f4f0] text-[#001435] hover:bg-[#F2CD69]/30 transition-colors"
                iconSize={22}
              />
            </div>
          </div>
        </div>
      </header>
    </>
  )
}
