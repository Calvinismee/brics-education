import { toast } from 'sonner';

export const showSuccessToast = (message) => {
    toast.success(message, {
        duration: 2600,
    });
};
