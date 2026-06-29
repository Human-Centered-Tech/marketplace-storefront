import { Checkbox } from '@/components/atoms';
import { cn } from '@/lib/utils';

export const FilterCheckboxOption = ({
  label,
  amount,
  checked = false,
  onCheck = () => null,
  disabled = false,
}: {
  label: string;
  amount?: number;
  checked?: boolean;
  onCheck?: (option: string) => void;
  disabled?: boolean;
}) => {
  return (
    // A <div>, not a <label>: the Checkbox atom renders its own <label>+<input>,
    // so wrapping it in another <label> nests labels (invalid HTML). That made a
    // single row-click re-dispatch and call onCheck twice — toggling on then off,
    // so a checked category could never be unchecked. A div with onClick fires
    // exactly once.
    <div
      role="checkbox"
      aria-checked={checked}
      aria-disabled={disabled || undefined}
      className={cn(
        'flex gap-4 items-center cursor-pointer select-none',
        disabled && '!cursor-default'
      )}
      onClick={() => (disabled ? null : onCheck(label))}
    >
      <Checkbox checked={checked} disabled={disabled} />
      <p
        className={cn(
          'label-md !font-normal',
          checked && '!font-semibold',
          disabled && 'text-disabled'
        )}
      >
        {label}{' '}
        {amount && (
          <span className='label-sm !font-light'>
            ({amount})
          </span>
        )}
      </p>
    </div>
  );
};
