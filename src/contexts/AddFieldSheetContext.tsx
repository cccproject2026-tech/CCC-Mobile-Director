import AddFieldSheet, {
    AddFieldSheetRef,
    FieldType,
} from "@/components/Sheets/AddFieldSheet";
import React, {
    createContext,
    useCallback,
    useRef,
    useMemo,
} from "react";

export type AddFieldHandlers = {
    onInsert: (data: any) => void;
    onClose: () => void;
};

type AddFieldSheetContextValue = {
    open: (type: FieldType, existingData?: any) => void;
    registerHandlers: (handlers: AddFieldHandlers | null) => void;
};

export const AddFieldSheetContext = createContext<AddFieldSheetContextValue | null>(null);

export function AddFieldSheetProvider({ children }: { children: React.ReactNode }) {
    const sheetRef = useRef<AddFieldSheetRef>(null);
    const handlersRef = useRef<AddFieldHandlers | null>(null);

    const registerHandlers = useCallback((handlers: AddFieldHandlers | null) => {
        handlersRef.current = handlers;
    }, []);

    const open = useCallback((type: FieldType, existingData?: any) => {
        sheetRef.current?.open(type, existingData);
    }, []);

    const handleInsert = useCallback((data: any) => {
        handlersRef.current?.onInsert(data);
    }, []);

    const handleClose = useCallback(() => {
        handlersRef.current?.onClose?.();
    }, []);

    const value = useMemo(
        () => ({ open, registerHandlers }),
        [open, registerHandlers]
    );

    return (
        <AddFieldSheetContext.Provider value={value}>
            {children}
            <AddFieldSheet
                ref={sheetRef}
                onInsert={handleInsert}
                onClose={handleClose}
            />
        </AddFieldSheetContext.Provider>
    );
}
