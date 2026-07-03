export const Dropdown = ({
  children,
  show,
}: {
  children: React.ReactNode;
  show: boolean;
}) => {
  if (!show) return null;

  // Mobile: the trigger wrapper is `static` (see CartDropdown/UserDropdown),
  // so this anchors to the sticky <header> instead of the icon — full viewport
  // width right under the header. Right-anchoring a `w-max` panel to an icon
  // near the right screen edge pushed it off the left side of small screens
  // (the "half-visible cart" bug). Desktop (lg+) keeps the original anchored
  // dropdown.
  return (
    <div className='absolute left-2 right-2 top-full max-h-[calc(100dvh-140px)] overflow-y-auto lg:left-auto lg:-right-2 lg:top-auto lg:max-h-none lg:overflow-visible lg:w-max bg-primary text-primary z-20 rounded-md shadow-lg'>
      {children}
    </div>
  );
};
