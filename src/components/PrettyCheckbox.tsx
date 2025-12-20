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
    <label className="inline-flex items-center cursor-pointer select-none group">
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
        border-2 border-white/20 rounded-lg md:rounded-full bg-card/50
        peer-checked:border-primary peer-checked:bg-primary
        peer-disabled:opacity-40 peer-focus:ring-2 peer-focus:ring-primary/30
        group-hover:border-primary/50 transition-all duration-300
      "
        >
            {/* ✔️ aparece sólo cuando está checkeado */}
            <Check
                size={14}
                className="
          text-white
          opacity-0 peer-checked:opacity-100
          transition-all duration-300 transform scale-50 peer-checked:scale-100
          pointer-events-none
        "
            />
        </span>
    </label>
);
export default PrettyCheckbox;