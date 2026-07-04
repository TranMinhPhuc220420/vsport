import * as React from 'react';

import {
    adminInputClassName,
    adminSelectClassName,
    adminTextareaClassName,
} from '@/components/admin/ui/admin-input-styles';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

type AdminFieldProps = {
    label: string;
    error?: string;
    hint?: string;
    children?: React.ReactNode;
    className?: string;
    htmlFor?: string;
};

export function AdminField({
    label,
    error,
    hint,
    children,
    className,
    htmlFor,
}: AdminFieldProps) {
    const generatedId = React.useId();
    const fieldId = htmlFor ?? generatedId;
    const errorId = `${fieldId}-error`;

    return (
        <div className={cn('space-y-1.5', className)}>
            <Label htmlFor={fieldId} className="admin-label">
                {label}
            </Label>
            {children ?? null}
            {hint && !error && <p className="admin-caption">{hint}</p>}
            {error && (
                <p
                    id={errorId}
                    className="admin-caption text-red-600"
                    role="alert"
                >
                    {error}
                </p>
            )}
        </div>
    );
}

type AdminInputFieldProps = Omit<React.ComponentProps<typeof Input>, 'id'> & {
    label: string;
    error?: string;
    hint?: string;
};

export function AdminInputField({
    label,
    error,
    hint,
    className,
    ...inputProps
}: AdminInputFieldProps) {
    const fieldId = React.useId();

    return (
        <AdminField label={label} error={error} hint={hint} htmlFor={fieldId}>
            <Input
                id={fieldId}
                aria-invalid={error ? true : undefined}
                className={cn(adminInputClassName, 'shadow-none', className)}
                {...inputProps}
            />
        </AdminField>
    );
}

type AdminTextareaFieldProps = Omit<React.ComponentProps<'textarea'>, 'id'> & {
    label: string;
    error?: string;
    hint?: string;
};

export function AdminTextareaField({
    label,
    error,
    hint,
    className,
    ...textareaProps
}: AdminTextareaFieldProps) {
    const fieldId = React.useId();

    return (
        <AdminField label={label} error={error} hint={hint} htmlFor={fieldId}>
            <textarea
                id={fieldId}
                aria-invalid={error ? true : undefined}
                className={cn(adminTextareaClassName, className)}
                {...textareaProps}
            />
        </AdminField>
    );
}

type AdminSelectFieldProps = {
    label: string;
    error?: string;
    hint?: string;
    value: string | number;
    onChange: (value: string) => void;
    options: { value: string | number; label: string }[];
    className?: string;
    disabled?: boolean;
};

export function AdminSelectField({
    label,
    error,
    hint,
    value,
    onChange,
    options,
    className,
    disabled,
}: AdminSelectFieldProps) {
    const fieldId = React.useId();

    return (
        <AdminField label={label} error={error} hint={hint} htmlFor={fieldId}>
            <select
                id={fieldId}
                aria-invalid={error ? true : undefined}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                className={cn(adminSelectClassName, className)}
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </AdminField>
    );
}
