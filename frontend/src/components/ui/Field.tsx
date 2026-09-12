import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { useId } from 'react';
import Icon, { type IconName } from './Icon';

interface FieldProps {
  label?: string;
  hint?: string;
  error?: string;
  htmlFor?: string;
  children: ReactNode;
}

export function Field({ label, hint, error, htmlFor, children }: FieldProps) {
  return (
    <div className="form-group">
      {label && <label className="form-label" htmlFor={htmlFor}>{label}</label>}
      {children}
      {hint && <p className="form-hint">{hint}</p>}
      {error && <p className="form-error">{error}</p>}
    </div>
  );
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: IconName;
  hint?: string;
  error?: string;
}

export function Input({ label, icon, hint, error, id, className, ...rest }: InputProps) {
  const autoId = useId();
  const inputId = id || autoId;
  return (
    <Field label={label} hint={hint} error={error} htmlFor={inputId}>
      {icon ? (
        <div className="input-icon">
          <Icon name={icon} size={18} className="cc-icon" />
          <input id={inputId} className={['form-input', className].filter(Boolean).join(' ')} {...rest} />
        </div>
      ) : (
        <input id={inputId} className={['form-input', className].filter(Boolean).join(' ')} {...rest} />
      )}
    </Field>
  );
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export function Select({ label, hint, error, id, className, children, ...rest }: SelectProps) {
  const autoId = useId();
  const selectId = id || autoId;
  return (
    <Field label={label} hint={hint} error={error} htmlFor={selectId}>
      <select id={selectId} className={['form-select', className].filter(Boolean).join(' ')} {...rest}>
        {children}
      </select>
    </Field>
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export function Textarea({ label, hint, error, id, className, ...rest }: TextareaProps) {
  const autoId = useId();
  const areaId = id || autoId;
  return (
    <Field label={label} hint={hint} error={error} htmlFor={areaId}>
      <textarea id={areaId} className={['form-input', className].filter(Boolean).join(' ')} {...rest} />
    </Field>
  );
}