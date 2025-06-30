import { ArchiveDocumentType } from "@/schema/archive";
import { Input } from "antd";
import React from "react";
import { Control, Controller, FieldErrors } from "react-hook-form";

type LabelProps = {
  required?: boolean;
  children: React.ReactNode;
} & React.DetailedHTMLProps<
  React.LabelHTMLAttributes<HTMLLabelElement>,
  HTMLLabelElement
>;

type CustomInputProps = {
  field: keyof ArchiveDocumentType;
  control: Control<ArchiveDocumentType, unknown, ArchiveDocumentType>;
  errors: FieldErrors<ArchiveDocumentType>;
  label: string;
  placeholder: string;
  required?: boolean;
  className?: string;
};

function CustomInput({
  control,
  field,
  required,
  label,
  placeholder,
  errors,
  className,
}: CustomInputProps) {
  return (
    <Controller
      control={control}
      name={field}
      render={({ field: { ...controllerField } }) => (
        <>
          <Label
            htmlFor={field as unknown as string}
            required={required}
            children={label}
          />
          <Input
            {...controllerField}
            placeholder={placeholder}
            className={className}
            status={errors?.[field] ? "error" : ""}
          />
          <ErrorMessage errors={errors} field={field} />
        </>
      )}
    />
  );
}

export default CustomInput;

const Label = ({ children, required = false, ...attributes }: LabelProps) => {
  return (
    <label
      {...attributes}
      className="block text-sm font-medium text-gray-700 mb-1"
    >
      {children} {required ? <span className="text-red-500">*</span> : null}
    </label>
  );
};

const ErrorMessage = ({
  errors,
  field,
}: Pick<CustomInputProps, "field" | "errors">) => {
  return (
    errors?.[field] && (
      <span className="text-red-500 text-sm">{errors?.[field].message}</span>
    )
  );
};
