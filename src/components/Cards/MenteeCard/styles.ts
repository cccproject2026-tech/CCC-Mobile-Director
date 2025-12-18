import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    listContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#1A4882", borderWidth: 1, borderColor: "rgba(255,255,255,0.3)", borderRadius: 14, padding: 10, marginBottom: 10 },
    selectedCard: { borderColor: "#38BDF8", borderWidth: 2 },

    listNameSection: { flex: 1 }, listName: { color: "#fff", fontWeight: "600", fontSize: 14 },

    profileImg: { overflow: "hidden", marginRight: 10, backgroundColor: "#14517D", alignItems: "center", justifyContent: "center" },
    image: { width: "100%", height: "100%" },

    container: { backgroundColor: "#1A4882", borderWidth: 1, borderColor: "rgba(255,255,255,0.3)", borderRadius: 16, padding: 14, marginBottom: 14 },
    menuButton: { position: "absolute", top: 14, right: 14, zIndex: 10 },

    topSection: { flexDirection: "row", marginBottom: 10 },
    contentSection: { flex: 1 },
    name: { color: "#fff", fontSize: 16, fontWeight: "600", marginBottom: 4 },
    description: { color: "rgba(255,255,255,0.8)", fontSize: 12, lineHeight: 16 },

    // contact
    contactRow: { flexDirection: "row", gap: 6, marginBottom: 10 },
    iconBtn: { width: 30, height: 30, alignItems: "center", justifyContent: "center" },

    // selection card
    selectionCard: { backgroundColor: "#1A4882", borderWidth: 1, borderColor: "rgba(255,255,255,0.3)", borderRadius: 16, padding: 14 },
    checkboxContainer: { position: "absolute", top: 12, right: 12 },
    checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: "rgba(255,255,255,0.4)", alignItems: "center", justifyContent: "center" },
    checkboxSelected: { backgroundColor: "#fff" },

    // progress
    progressRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
    progressLabel: { color: "#fff", fontSize: 12, width: 60 },
    progressBar: { flex: 1, height: 6, backgroundColor: "rgba(255,255,255,0.3)", borderRadius: 3 },
    progressFill: { height: "100%", backgroundColor: "#fff" },
    progressText: { color: "#fff", fontSize: 12, marginLeft: 6 },

    // actions
    btnWrap: { borderRadius: 12, padding: 2 },
    actionBtn: { backgroundColor: "#1A4882", borderRadius: 10, paddingVertical: 12, alignItems: "center" },
    btnTxt: { color: "#fff", fontSize: 14, fontWeight: "600" },
});
