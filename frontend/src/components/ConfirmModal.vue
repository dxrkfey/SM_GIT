<script setup>
const props = defineProps({
    toggleAlert: Function,
    confirmMessage: String,
    isModalVisible: Boolean
});

const emit = defineEmits(["confirm", "cancel"]);

const confirm = () => {
    emit("confirm");
};

const cancel = () => {
    emit("cancel");
};
</script>

<template>
    <transition name="fade">
        <div v-if="isModalVisible" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
            @click.self="cancel">
            <div class="bg-white rounded-lg shadow-md w-11/12 max-w-md p-6" role="dialog" aria-modal="true"
                aria-labelledby="modal-title">
                <div class="flex justify-end">
                    <button aria-label="Close" class="text-gray-500 hover:text-gray-700 focus:outline-none"
                        @click="cancel">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div class="flex justify-center mb-4">
                    <img src="@/assets/alert_icon.svg" alt="Alert Icon" class="h-12 w-12" />
                </div>
                <h2 class="text-xl font-semibold text-gray-800 text-center mb-2" id="modal-title">
                    {{ confirmMessage }}
                </h2>
                <p class="text-gray-600 text-center mb-6">
                    Are you sure you want to proceed?
                </p>
                <div class="flex justify-center space-x-4">
                    <button
                        class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 transition"
                        @click="confirm">
                        Confirm
                    </button>
                    <button
                        class="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 transition"
                        @click="cancel">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    </transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.fade-enter-active .fixed,
.fade-leave-active .fixed {
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>