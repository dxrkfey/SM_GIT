import { ref } from "vue";

export function useResetPass() {
    const isResetPassVisible = ref(false);
    const resetPassMessage = ref("");
    let resolveResetPass: (value: [boolean, string]) => void;

    const showResetPass = (message: string): Promise<[boolean, string]> => {
        resetPassMessage.value = message;
        isResetPassVisible.value = true;
        return new Promise((resolve) => {
            resolveResetPass = resolve;
        });
    };

    const resetPass = (password: string) => {
        if (resolveResetPass) {
            resolveResetPass([true, password]);
        }
        closeResetPass();
    };

    const cancelResetPass = () => {
        if (resolveResetPass) {
            resolveResetPass([false, ""]);
        }
        closeResetPass();
    };

    const closeResetPass = () => {
        isResetPassVisible.value = false;
        resetPassMessage.value = "";
    };

    return {
        isResetPassVisible,
        resetPassMessage,
        showResetPass,
        resetPass,
        cancelResetPass,
    };
}
