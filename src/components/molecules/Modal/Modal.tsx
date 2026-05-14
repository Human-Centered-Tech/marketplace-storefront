import { CloseIcon } from "@/icons"

export const Modal = ({
  children,
  heading,
  onClose,
}: {
  children: React.ReactNode
  heading: string
  onClose: () => void
}) => {
  return (
    // Outer at z-[60] so we render above the sticky Header (z-50) — the
    // previous z-30 left the modal header tucked behind the page header.
    <div className="fixed top-0 left-0 w-full h-full flex justify-center z-[60]">
      <div
        className="bg-tertiary/60 w-full h-full absolute backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="absolute bg-primary z-[70] my-20 py-5 rounded-sm max-w-[600px] w-full max-h-[80vh] overflow-y-auto shadow-lg">
        <div className="uppercase flex justify-between items-center heading-md border-b px-4 pb-5">
          {heading}
          <div onClick={onClose} className="cursor-pointer">
            <CloseIcon size={20} />
          </div>
        </div>
        <div className="pt-5">{children}</div>
      </div>
    </div>
  )
}
