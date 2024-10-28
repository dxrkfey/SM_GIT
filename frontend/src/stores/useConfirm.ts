import { ref } from "vue";

export function useConfirm() {
    const isModalVisible = ref(false);
    const confirmMessage = ref("");
    let resolveConfirm: (value: boolean) => void;

    const showConfirm = (message: string): Promise<boolean> => {
        confirmMessage.value = message;
        isModalVisible.value = true;
        return new Promise<boolean>((resolve) => {
            resolveConfirm = resolve;
        });
    };

    const confirm = () => {
        if (resolveConfirm) {
            resolveConfirm(true);
        }
        closeConfirm();
    };

    const cancel = () => {
        if (resolveConfirm) {
            resolveConfirm(false);
        }
        closeConfirm();
    };

    const closeConfirm = () => {
        isModalVisible.value = false;
        confirmMessage.value = "";
    };

    return {
        isModalVisible,
        confirmMessage,
        showConfirm,
        confirm,
        cancel,
    };
}
