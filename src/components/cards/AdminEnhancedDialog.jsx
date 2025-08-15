// EnhancedDialog.jsx
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "react-toastify";

const AdminEnhancedDialog = ({
  open,
  onOpenChange,
  title = "Dialog Title",
  description = "This is a dialog description",
  initialData = {},
  fields = [],
  onSubmit,
  processing = false,
  submitText = "Save changes",
  cancelText = "Cancel",
  renderCustomField = null, // For completely custom field rendering
}) => {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);

  const getClassName = (initialData) => {
    if (initialData.startDate) {
      if (initialData?.status === "APPROVED" && !initialData?.responseDate) {
        return "bg-green-500 hover:bg-green-600";
      }
      if (
        (initialData?.status === "REJECTED" && !initialData?.responseDate) ||
        (initialData?.status === "CANCELLED" && !initialData?.responseDate)
      ) {
        return "bg-red-500 hover:bg-red-600";
      }
      if (initialData?.status === "PENDING" && initialData?.responseDate) {
        return "bg-gray-500 hover:bg-gray-600";
      }
    }
    return "bg-[#566f99] hover:bg-[#4a5f85]";
  };

  // Update formData if initialData changes (e.g., when editing different entities)
  useEffect(() => {
    if (open) {
      setFormData(initialData);
      setErrors({});
    }
  }, [initialData, open]);

  const handleChange = (name, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    // Clear error when field is changed
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    fields.forEach((field) => {
      if (field.required) {
        const value = formData[field.name];
        if (value === undefined || value === null || value === "") {
          newErrors[field.name] = `${field.label} is required`;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      // Don't call onSubmit here, just show the confirmation dialog
      setApprovalDialogOpen(true);
    }
  };

  const handleApproveReject = (status) => {
    // Update form data with the new status
    const updatedFormData = { ...formData, status };
    setFormData(updatedFormData);
    setApprovalDialogOpen(true);
  };

  const resetAndClose = () => {
    setFormData(initialData);
    setErrors({});
    onOpenChange(false);
  };

  // Render the appropriate input based on field type
  const renderField = (field) => {
    const hasError = !!errors[field.name];

    switch (field.type) {
      case "select":
        return (
          <div>
            <Select
              value={formData[field.name] || ""}
              onValueChange={(value) => handleChange(field.name, value)}
              required={field.required}
              disabled={field.disabled}
            >
              <SelectTrigger
                className={`w-full rounded py-2 px-3 border ${
                  hasError ? "border-red-500" : "border-gray-300"
                } focus:ring-2 focus:ring-[#566f99] focus:border-transparent`}
              >
                <SelectValue
                  placeholder={field.placeholder || `Select ${field.label}`}
                />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 shadow-lg rounded-md">
                {field.options?.map((option) => {
                  // Handle both string options and object options
                  const value =
                    typeof option === "string"
                      ? option
                      : option?.value || option?.name;
                  const label =
                    typeof option === "string"
                      ? option
                      : option?.label || option?.name;
                  return (
                    <SelectItem
                      key={value}
                      value={value}
                      className="cursor-pointer hover:bg-gray-100 focus:bg-gray-100"
                    >
                      {label}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {hasError && (
              <p className="text-red-500 text-sm mt-1">{errors[field.name]}</p>
            )}
          </div>
        );

      case "textarea":
        return (
          <div>
            <Textarea
              id={field.name}
              name={field.name}
              value={formData[field.name] || ""}
              onChange={(e) => handleChange(field.name, e.target.value)}
              placeholder={field.placeholder || ""}
              className={`w-full rounded py-2 px-3 border ${
                hasError ? "border-red-500" : "border-gray-300"
              } focus:ring-2 focus:ring-[#566f99] focus:border-transparent`}
              rows={field.rows || 3}
              required={field.required}
            />
            {hasError && (
              <p className="text-red-500 text-sm mt-1">{errors[field.name]}</p>
            )}
          </div>
        );

      case "checkbox":
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={field.name}
              checked={!!formData[field.name]}
              onCheckedChange={(checked) => handleChange(field.name, checked)}
              required={field.required}
            />
            <label
              htmlFor={field.name}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {field.checkboxLabel || field.label}
            </label>
            {hasError && (
              <p className="text-red-500 text-sm ml-2">{errors[field.name]}</p>
            )}
          </div>
        );

      case "date":
        return (
          <div>
            <Input
              id={field.name}
              name={field.name}
              type="date"
              value={formData[field.name] || ""}
              onChange={(e) => handleChange(field.name, e.target.value)}
              className={`w-full rounded py-2 px-3 border ${
                hasError ? "border-red-500" : "border-gray-300"
              } focus:ring-2 focus:ring-[#566f99] focus:border-transparent`}
              min={field.min}
              max={field.max}
              required={field.required}
            />
            {hasError && (
              <p className="text-red-500 text-sm mt-1">{errors[field.name]}</p>
            )}
          </div>
        );

      // Default is regular text input
      default:
        return (
          <div>
            <Input
              id={field.name}
              name={field.name}
              value={formData[field.name] || ""}
              onChange={(e) => handleChange(field.name, e.target.value)}
              placeholder={field.placeholder || ""}
              className={`w-full rounded py-2 px-3 border ${
                hasError ? "border-red-500" : "border-gray-300"
              } focus:ring-2 focus:ring-[#566f99] focus:border-transparent`}
              type={field.type || "text"}
              disabled={field.disabled}
              required={field.required}
            />
            {hasError && (
              <p className="text-red-500 text-sm mt-1">{errors[field.name]}</p>
            )}
          </div>
        );
    }
  };

  return (
    <div>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] bg-white p-6 rounded-lg shadow-lg max-h-[90vh] overflow-y-auto">
          <form className="space-y-6">
            <DialogHeader className="space-y-2 sticky top-0 bg-white z-10 pb-4">
              <DialogTitle className="text-2xl font-bold text-gray-900">
                {title}
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                {description}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {renderCustomField
                ? renderCustomField({
                    formData,
                    setFormData,
                    handleChange: (name, value) => handleChange(name, value),
                  })
                : fields.map((field) => (
                    <div key={field.name} className="space-y-2">
                      {field.type !== "checkbox" && (
                        <Label
                          htmlFor={field.name}
                          className="text-sm font-medium text-gray-700"
                        >
                          {field.label}
                        </Label>
                      )}
                      {renderField(field)}
                    </div>
                  ))}
            </div>

            <DialogFooter className="flex justify-end space-x-3 pt-4 sticky bottom-0 bg-white z-10">
              <Button
                type="button"
                variant="outline"
                onClick={resetAndClose}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                disabled={processing}
              >
                {cancelText}
              </Button>
              {initialData?.status === "PENDING" && (
                <>
                  <Button
                    type="button"
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded cursor-pointer"
                    onClick={() => handleApproveReject("REJECTED")}
                    disabled={processing}
                  >
                    {processing ? "Saving..." : "Reject Request"}
                  </Button>
                  <Button
                    type="button"
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded cursor-pointer"
                    onClick={() => handleApproveReject("APPROVED")}
                    disabled={processing}
                  >
                    Approve Request
                  </Button>
                </>
              )}
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={approvalDialogOpen}
        onOpenChange={setApprovalDialogOpen}
      >
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {formData.status === "REJECTED"
                ? "Reject Leave Request"
                : "Approve Leave Request"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to{" "}
              {formData.status === "REJECTED" ? "reject" : "approve"} this leave
              request? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, keep it pending</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onSubmit(formData)}
              disabled={processing}
              className={
                formData.status === "REJECTED"
                  ? "bg-red-600 hover:bg-red-700 text-white cursor-pointer"
                  : "bg-green-600 hover:bg-green-700 text-white cursor-pointer"
              }
            >
              {processing
                ? formData.status === "REJECTED"
                  ? "Rejecting..."
                  : "Approving..."
                : formData.status === "REJECTED"
                ? "Yes, reject it"
                : "Yes, approve it"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminEnhancedDialog;
