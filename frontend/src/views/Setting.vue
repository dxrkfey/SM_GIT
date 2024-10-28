<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useSmokeStore } from '@/stores/smoke';
import { useConfirm } from "@/stores/useConfirm.js";
import { useResetPass } from "@/stores/useResetPass";
import ResetPassModal from "@/components/ResetPassModal.vue";
import ConfirmModal from "@/components/ConfirmModal.vue";
const smokeStore = useSmokeStore();

const profilePic = ref<string | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);
const { isModalVisible, confirmMessage, showConfirm, confirm, cancel } = useConfirm();
const { isResetPassVisible, resetPassMessage, showResetPass, resetPass, cancelResetPass } = useResetPass();

const username = computed({
  get: () => smokeStore.username,
  set: (value) => (smokeStore.username = value),
});

const company = computed({
  get: () => smokeStore.company,
  set: (value) => (smokeStore.company = value),
});

const email = computed({
  get: () => smokeStore.email,
  set: (value) => (smokeStore.email = value),
});

const phone = computed({
  get: () => smokeStore.phone,
  set: (value) => (smokeStore.phone = value),
});

const address = computed({
  get: () => smokeStore.address,
  set: (value) => (smokeStore.address = value),
});

const notificationTokens = computed({
  get: () => smokeStore.notificationTokens,
  set: (value) => (smokeStore.notificationTokens = value),
});

const profilePicData = computed({
  get: () => smokeStore.profilePicData,
  set: (value) => (smokeStore.profilePicData = value),
});



const handleProfilePicChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.src = reader.result as string;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const maxWidth = 500;
      const maxHeight = 500;
      let { width, height } = img;

      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, width, height);

      const resizedBase64 = canvas.toDataURL('image/jpeg', 0.8);
      profilePic.value = resizedBase64;
      profilePicData.value = resizedBase64.split(',')[1];

    };
  };

  reader.onerror = (error) => {
    console.error('Error reading file:', error);
    alert('Failed to load image. Please try again with a different file.');
  };

  reader.readAsDataURL(file);
};

const triggerFileInput = () => {
  if (fileInput.value) {
    fileInput.value.click();
  }
};

const saveData = async () => {
  try {
    const confirmed = await showConfirm("Edit Setting");
    if (confirmed) {
      try {
        for (const tokenObj of notificationTokens.value) {
          try {
            if (tokenObj.LineID) {
              await smokeStore.updateLineToken(tokenObj.LineID, tokenObj.notificationToken);
            } else {
              await smokeStore.addLineToken(tokenObj.notificationToken);
            }
          } catch (tokenError) {
            console.error(`Error updating/adding token for LineID ${tokenObj.LineID || 'new token'}:`, tokenError);
          }
        }
        await smokeStore.editUser({
          username: username.value,
          company: company.value,
          email: email.value,
          phone: phone.value,
          address: address.value,
          profilePicData: profilePicData.value,
        });
      } catch (editError) {
        console.error("Error updating user settings:", editError);
        throw new Error("Failed to update user settings.");
      }
    }

    smokeStore.updateUserInfo({
      username: username.value,
      company: company.value,
      email: email.value,
      phone: phone.value,
      address: address.value,
      profilePicData: profilePicData.value,
    });

    await smokeStore.loadUserData();
    console.log("User data saved successfully.");

  } catch (error) {
    console.error('Error in saveData function:', error);
  }
};


const resetPassword = async () => {
  try {
    const [confirmed, pass] = await showResetPass("Reset Password");
    if (confirmed) {
      await useSmokeStore.resetPassword(pass);
      console.log("Password reset successfully");
      alert("Reset password successfully");
    }
  } catch (error) {
    alert("Failed to reset password");
  }
};

const addNotificationToken = () => {
  smokeStore.addNotificationToken({ LineID: null, notificationToken: '' });
};

const removeNotificationToken = async (index: number) => {
  await smokeStore.removeLineToken(index);
  await smokeStore.loadUserData();
};

onMounted(async () => {
  await smokeStore.loadUserData();
  profilePic.value = smokeStore.profilePicData
    ? `data:image/png;base64,${smokeStore.profilePicData}`
    : '';
});
</script>
<template>
  <ResetPassModal :resetPassMessage="resetPassMessage" :isResetPassVisible="isResetPassVisible"
    v-show="isResetPassVisible" @resetPass="resetPass" @cancel="cancelResetPass" />
  <ConfirmModal :confirmMessage="confirmMessage" :isModalVisible="isModalVisible" v-show="isModalVisible"
    @confirm="confirm" @cancel="cancel" />

  <div>
    <div class="flex flex-col h-auto mt-2 justify-center w-full p-4 sm:p-6">
      <div>
        <h2 class="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-gray-700">
          My Account
        </h2>
        <hr class="mb-4 sm:mb-6" />
        <div class="flex flex-col sm:flex-row items-center mb-4 sm:mb-6 space-y-4 sm:space-y-0 sm:space-x-8">
          <div class="relative cursor-pointer group" @click="triggerFileInput">
            <div class="w-[10rem] h-[10rem] rounded-full overflow-hidden flex items-center justify-center bg-gray-200">
              <img v-if="profilePic" :src="profilePic" alt="Profile Picture" class="object-cover w-full h-full" />
              <div v-else class="text-gray-500 text-6xl">
                👤
              </div>
            </div>
            <div
              class="absolute inset-0 flex items-center justify-center text-white text-2xl bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
              📷
            </div>
            <input ref="fileInput" type="file" accept="image/*" @change="handleProfilePicChange" class="hidden" />
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            <div>
              <label class="block font-semibold mb-1 text-gray-600">Username</label>
              <input type="text" v-model="username" placeholder="Enter your username" maxlength="30"
                class="w-full rounded-md h-10 bg-gray-100 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label class="block font-semibold mb-1 text-gray-600">Company</label>
              <input type="text" v-model="company" placeholder="Enter your company" maxlength="30"
                class="w-full rounded-md h-10 bg-gray-100 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label class="block font-semibold mb-1 text-gray-600">Email</label>
              <input type="email" v-model="email" placeholder="Enter your email" maxlength="50"
                class="w-full rounded-md h-10 bg-gray-100 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label class="block font-semibold mb-1 text-gray-600">Phone</label>
              <input type="tel" v-model="phone" placeholder="Enter your phone number" maxlength="15"
                class="w-full rounded-md h-10 bg-gray-100 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label class="block font-semibold mb-1 text-gray-600">Password</label>
              <button
                class="bg-red-500 w-full text-white py-2 px-6 rounded-lg hover:bg-red-600 transition duration-300 shadow-md"
                @click="resetPassword">
                Reset Password
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-8">
        <h2 class="text-xl sm:text-2xl font-semibold mb-4 text-gray-700">
          Notification
        </h2>
        <hr class="mb-4" />
        <div class="flex items-center gap-4 mb-4">
          <div class="w-12 h-12 flex items-center justify-center bg-gray-200 rounded-full">
            🔔
          </div>
          <div class="flex-grow">
            <div class="flex items-center">
              <label class="block font-semibold text-gray-600 mr-2">Notification Tokens</label>
              <button @click="addNotificationToken"
                class="text-blue-500 text-2xl transition-transform duration-200 transform hover:scale-125">
                ➕
              </button>
            </div>
          </div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mb-4">
          <div v-for="(tokenObj, index) in notificationTokens" :key="index" class="relative group">
            <label class="block font-semibold mb-1 text-gray-600">Token {{ index + 1 }}</label>
            <input type="text" v-model="tokenObj.notificationToken" placeholder="Enter your notification token"
              class="w-full rounded-md h-10 bg-gray-100 px-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <button @click="removeNotificationToken(tokenObj.LineID)"
              class="absolute top-0 right-0 mt-8 mr-2 text-red-500 transition-transform duration-200 transform hover:scale-125"
              aria-label="Remove Token">
              🗑️
            </button>
          </div>
        </div>
        <div class="flex justify-end">
          <button @click="saveData" aria-label="Save Notification Tokens"
            class="bg-green-500 text-white py-2 px-6 rounded-lg hover:bg-green-600 hover:shadow-lg transition duration-300 shadow-md">
            Save
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
