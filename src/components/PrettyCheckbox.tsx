import { Check } from 'lucide-react';

interface PrettyCheckboxProps {
    checked: boolean;
    onToggle: () => void;
    disabled?: boolean;
}

const PrettyCheckbox: React.FC<PrettyCheckboxProps> = ({
                                                           checked,
                                                           onToggle,
                                                           disabled = false,
                                                       }) => (
    <label className="inline-flex items-center cursor-pointer select-none">
        {/* input real, oculto para accesibilidad */}
        <input
            type="checkbox"
            checked={checked}
            onChange={onToggle}
            disabled={disabled}
            className="sr-only peer"
        />

        {/* círculo visual */}
        <span
            className="
        w-[22px] h-[22px] flex items-center justify-center
        border-2 border-gray-400 rounded-full
        peer-checked:border-emerald-500 peer-checked:bg-emerald-500
        peer-disabled:opacity-40
        transition-colors
      "
        >
      {/* ✔️ aparece sólo cuando está checkeado */}
            <Check
                size={14}
                className="
          text-white
          opacity-0 peer-checked:opacity-100
          transition-opacity
          pointer-events-none
        "
            />
    </span>
    </label>
);
export default PrettyCheckbox;