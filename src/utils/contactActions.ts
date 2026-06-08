import { Alert, Linking } from "react-native";

function openUrl(url: string, label: string) {
  Linking.canOpenURL(url)
    .then((ok) => {
      if (ok) Linking.openURL(url);
      else Alert.alert("Unable to open", `Cannot open ${label}.`);
    })
    .catch(() => Alert.alert("Unable to open", `Cannot open ${label}.`));
}

export function dialPhone(raw?: string | null) {
  if (!raw?.trim()) {
    Alert.alert("No phone number", "Phone number is not available.");
    return;
  }
  const normalized = raw.replace(/[^\d+]/g, "");
  openUrl(`tel:${normalized}`, "phone");
}

export function sendEmail(address?: string | null) {
  if (!address?.trim()) {
    Alert.alert("No email", "Email is not available.");
    return;
  }
  openUrl(`mailto:${encodeURIComponent(address.trim())}`, "email");
}

export function openSMS(phone?: string | null) {
  if (!phone?.trim()) {
    Alert.alert("No phone number", "Phone number is not available.");
    return;
  }

  const normalized = phone.replace(/[^\d+]/g, "");

  Linking.canOpenURL(`sms:${normalized}`)
    .then((supported) => {
      if (supported) {
        Linking.openURL(`sms:${normalized}`);
      } else {
        Alert.alert("Unable to open", "SMS app is not available.");
      }
    })
    .catch(() => {
      Alert.alert("Unable to open", "SMS app is not available.");
    });
}

/** WhatsApp web / app link from digits (country code should be included when possible). */
export function openWhatsApp(phone?: string | null) {
  if (!phone?.trim()) {
    Alert.alert("No phone number", "WhatsApp needs a phone number.");
    return;
  }
  const digits = phone.replace(/\D/g, "");
  if (!digits) {
    Alert.alert("No phone number", "WhatsApp needs a valid phone number.");
    return;
  }
  openUrl(`https://wa.me/${digits}`, "WhatsApp");
}

export function chatNotAvailableYet() {
  Alert.alert("Chat", "In-app chat is not available in the mobile app yet.");
}

export function featureNotAvailableYet(name: string) {
  Alert.alert("Not available", `${name} is not available in the mobile app yet.`);
}