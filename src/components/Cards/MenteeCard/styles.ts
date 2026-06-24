import { Platform, StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    // LIST layout
    listContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(255,255,255,0.08)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.12)",
        borderRadius: 14,
        padding: 12,
        marginBottom: 10,
        justifyContent: "space-between",
    },
    selectedCard: { borderColor: "#6FD4BE", borderWidth: 1.5 },

    listNameSection: { flex: 1 },
    listName: { color: "#fff", fontWeight: "700", fontSize: 14 },

    profileImg: {
        overflow: "hidden",
        marginRight: 10,
        backgroundColor: "rgba(255,255,255,0.12)",
        alignItems: "center",
        justifyContent: "center",
    },
    image: { width: "100%", height: "100%" },

    // FULL CARD layout
    container: {
        backgroundColor: "rgba(255,255,255,0.09)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.14)",
        borderRadius: 16,
        padding: 14,
        marginBottom: 12,
    },
    menuButton: {
        position: "absolute",
        top: 14,
        right: 14,
        zIndex: 30,
        backgroundColor: "transparent",
    },
    chevronButton: {
        position: "absolute",
        top: 14,
        right: 14,
        zIndex: 30,
        elevation: Platform.OS === "android" ? 12 : 0,
        padding: 4,
    },
    chevronButtonMid: {
        position: "absolute",
        top: "50%",
        right: 14,
        zIndex: 30,
        elevation: Platform.OS === "android" ? 12 : 0,
        padding: 4,
        transform: [{ translateY: -11 }],
    },
    contentSectionWithMenu: {
        paddingRight: 28,
    },

    topSection: { flexDirection: "row" },
    contentSection: { flex: 1 },
    name: { color: "#fff", fontSize: 14, fontWeight: "700", marginBottom: 6 },
    description: { color: "rgba(255,255,255,0.65)", fontSize: 12, lineHeight: 18 },

    // contact
    contactRow: { flexDirection: "row", gap: 6 },
    iconBtn: { width: 23, height: 23, alignItems: "center", justifyContent: "center" },

    // SELECTION CARD layout
    selectionCard: {
        backgroundColor: "rgba(255,255,255,0.09)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.14)",
        borderRadius: 16,
        padding: 14,
        marginBottom: 12,
    },
    checkboxContainer: { position: "absolute", top: 12, right: 12 },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 7,
        borderWidth: 1.5,
        borderColor: "rgba(255,255,255,0.35)",
        backgroundColor: "rgba(255,255,255,0.08)",
        alignItems: "center",
        justifyContent: "center",
    },
    checkboxSelected: { backgroundColor: "#6FD4BE", borderColor: "#6FD4BE" },

    // progress
    progressRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
    progressLabel: { color: "rgba(255,255,255,0.7)", fontSize: 12, width: 60 },
    progressBar: { flex: 1, height: 5, backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 3 },
    progressFill: { height: "100%", backgroundColor: "#6FD4BE", borderRadius: 3 },
    progressText: { color: "rgba(255,255,255,0.8)", fontSize: 12, marginLeft: 6 },

    // actions
    btnWrap: { borderRadius: 12, padding: 2 },
    actionBtn: {
        backgroundColor: "rgba(255,255,255,0.10)",
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.16)",
    },
    btnTxt: { color: "#fff", fontSize: 14, fontWeight: "700" },
});
