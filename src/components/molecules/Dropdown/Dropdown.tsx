export const Dropdown = ({
  children,
  show,
}: {
  children: React.ReactNode;
  show: boolean;
}) => {
  if (!show) return null;

  return (
    <div className='absolute -right-2 bg-primary text-primary z-20 rounded-md shadow-lg w-max'>
      {children}
    </div>
  );
};
