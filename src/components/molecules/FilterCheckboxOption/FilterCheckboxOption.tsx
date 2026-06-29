import { cn } from '@/lib/utils';
import { TickThinIcon } from '@/icons';

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
    // ONE <label> wrapping ONE real <input>, toggled via the input's onChange.
    // The previous version wrapped the shared Checkbox atom — which renders its
    // OWN <label>+<input> — so a click on the box re-dispatched through the
    // nested label and fired the handler twice (toggle on, then off): a checked
    // category could never be unchecked. onChange fires exactly once per change,
    // for clicks on the box OR the text, so this can't double-fire.
    <label
      className={cn(
        'flex gap-4 items-center cursor-pointer select-none',
        disabled && '!cursor-default'
      )}
    >
      <span
        className={cn(
          'checkbox-wrapper',
          checked && '!bg-action',
          disabled && '!bg-disabled !border-disabled !cursor-default'
        )}
      >
        {checked && !disabled && <TickThinIcon size={20} />}
        <input
          type="checkbox"
          className={cn(
            'w-[20px] h-[20px] opacity-0 cursor-pointer',
            disabled && 'cursor-default'
          )}
          checked={checked}
          disabled={disabled}
          onChange={() => (disabled ? null : onCheck(label))}
        />
      </span>
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
    </label>
  );
};
