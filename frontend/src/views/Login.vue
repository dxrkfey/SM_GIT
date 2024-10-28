<script setup>
import { useSmokeStore } from '@/stores/smoke';
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const smokeStore = useSmokeStore();

const userData = reactive({
    email: "",
    password: "",
});

const loginError = ref("");

localStorage.removeItem("token")
const login = async () => {
    loginError.value = "";
    if (userData.email === "" || userData.password === "") {
        loginError.value = "Both email and password are required.";
        return;
    }

    try {
        const res = await smokeStore.login(userData);
        if (res.isOk) {
            router.push({ name: "Home" });
        } else {
            loginError.value = "Login failed. Please check your credentials.";
        }
    } catch (error) {
        loginError.value = "Email or Password is wrong.";
    }
};
</script>

<template>
    <div class="min-h-screen flex items-center justify-center bg-[url('@/assets/bg.gif')] bg-no-repeat bg-cover">
        <div class="bg-white w-full max-w-xs sm:max-w-sm md:max-w-md p-6 sm:p-8 md:p-9 rounded-xl shadow-md">
            <div class="text-center mb-4 sm:mb-6">
                <img src="@/assets/QonnectLogo.svg" alt="Qonnect Logo" class="h-10 sm:h-12 md:h-14 mx-auto" />
            </div>

            <div class="mb-3 sm:mb-4">
                <label for="email" class="block text-sm font-semibold text-gray-700 mb-1 sm:mb-2">Email</label>
                <input
                    type="email"
                    id="email"
                    v-model="userData.email"
                    class="bg-gray-100 border border-gray-300 rounded-lg w-full h-10 p-3 sm:p-4 text-gray-700 focus:outline-none focus:border-blue-500"
                    placeholder="Enter your email"
                    @keyup.enter="login"
                />
            </div>

            <div class="mb-4 sm:mb-6">
                <label for="password" class="block text-sm font-semibold text-gray-700 mb-1 sm:mb-2">Password</label>
                <input
                    type="password"
                    id="password"
                    v-model="userData.password"
                    class="bg-gray-100 border border-gray-300 rounded-lg w-full h-10 p-3 sm:p-4 text-gray-700 focus:outline-none focus:border-blue-500"
                    placeholder="Enter your password"
                    @keyup.enter="login"
                />
            </div>

            <div v-if="loginError" class="text-red-500 text-sm mb-3 sm:mb-4 text-center">
                {{ loginError }}
            </div>

            <button
                class="bg-blue-600 text-white font-semibold w-full h-10 rounded-lg focus:outline-none transition-all hover:bg-blue-700"
                @click="login"
            >
                Login
            </button>
        </div>
    </div>
</template>
