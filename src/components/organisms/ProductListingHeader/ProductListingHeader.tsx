export const ProductListingHeader = ({ total }: { total: number }) => {
  return (
    <div className="flex justify-between w-full items-center mb-6">
      <span className="font-sans text-sm text-[#44474e]">
        {total} {total === 1 ? "listing" : "listings"}
      </span>
    </div>
  )
}
