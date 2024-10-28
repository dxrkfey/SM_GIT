<script setup>
import { ref, watch } from "vue";

const props = defineProps({
    resetPassMessage: String,
    isResetPassVisible: Boolean,
});

const emit = defineEmits(["resetPass", "cancel"]);

const password = ref("");
const confirmPassword = ref("");
const errorMessage = ref("");

const reset = () => {
    if (password.value !== confirmPassword.value) {
        errorMessage.value = "Passwords do not match";
        return;
    }
    if (!password.value || !confirmPassword.value) {
        errorMessage.value = "Please enter both passwords";
        return;
    }
    emit("resetPass", password.value); 
    password.value = "";
    confirmPassword.value = "";
};

const cancel = () => {
    emit("cancel");
    password.value = "";
    confirmPassword.value = "";
};
</script>

<template>
    <transition name="fade">
        <div v-if="isResetPassVisible"
            class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40" @click.self="cancel">
            <div class="bg-white rounded-lg shadow-md sm:max-w-sm sm:w-full overflow-hidden" role="dialog"
                aria-modal="true" aria-labelledby="modal-title">
                <div class="flex justify-between items-center px-4 py-3 border-b border-gray-200">
                    <h2 class="text-lg font-medium text-gray-800" id="modal-title">
                        Reset Password
                    </h2>
                    <button aria-label="Close" class="text-gray-500 hover:text-gray-700 focus:outline-none"
                        @click="cancel">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div class="px-4 py-5">
                    <div class="space-y-4">
                        <div>
                            <label class="block text-gray-700 text-sm mb-1">
                                New Password
                            </label>
                            <input type="password" v-model="password" placeholder="Enter new password"
                                class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400" />
                        </div>
                        <div>
                            <label class="block text-gray-700 text-sm mb-1">
                                Confirm Password
                            </label>
                            <input type="password" v-model="confirmPassword" placeholder="Confirm new password"
                                class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400" />
                        </div>
                    </div>

                    <p v-if="errorMessage" class="mt-4 text-sm text-red-500">
                        {{ errorMessage }}
                    </p>

                    <div class="mt-6 flex justify-end space-x-2">
                        <button
                            class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none focus:ring-1 focus:ring-blue-400 transition"
                            @click="reset">
                            Reset
                        </button>
                        <button
                            class="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-300 transition"
                            @click="cancel">
                            Cancel
                        </button>
                    </div>
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
