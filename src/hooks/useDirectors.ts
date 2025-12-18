import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { directorService } from "@/services/director.service";
import { CreateUserRequest } from "@/types/user.types";

export const useDirectors = () => {
    return useQuery({
        queryKey: ["directors"],
        queryFn: () => directorService.getAll(),
    });
};

export const useDirectorById = (id?: string) => {
    return useQuery({
        queryKey: ["director", id],
        queryFn: () => (id ? directorService.getById(id) : null),
        enabled: !!id,
    });
};

export const useCreateDirector = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: directorService.createDirector,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["directors"] }),
    });
};

export const useUpdateDirector = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: any }) =>
            directorService.updateDirector(id, payload),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["directors"] }),
    });
};

export const useDeleteDirector = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => directorService.deleteDirector(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["directors"] }),
    });
};


export const useAddUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateUserRequest) => {
            console.log("[useAddUser.mutationFn] called with:", payload);
            return directorService.addUser(payload);
        },
        onSuccess: (data) => {
            console.log("[useAddUser.onSuccess] data:", data);
            queryClient.invalidateQueries();
        },
        onError: (error) => {
            console.log("[useAddUser.onError] error:", error);
        },
    });
};