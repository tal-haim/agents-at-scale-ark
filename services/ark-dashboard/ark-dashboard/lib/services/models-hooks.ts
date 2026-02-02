import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { toast } from 'sonner';

import type { ModelCreateRequest, ModelUpdateRequest } from './models';
import { modelsService } from './models';

export const GET_ALL_MODELS_QUERY_KEY = 'get-all-models';
export const GET_MODEL_BY_ID_QUERY_KEY = 'get-model-by-id';

type UseGetAllModelsProps = {
  namespace?: string;
};

export const useGetAllModels = (props?: UseGetAllModelsProps) => {
  return useQuery({
    queryKey: [GET_ALL_MODELS_QUERY_KEY, props?.namespace],
    queryFn: () => modelsService.getAll(props?.namespace),
  });
};

type UseCreateModelProps = {
  onSuccess?: () => void;
  namespace?: string;
};

export const useCreateModel = (props?: UseCreateModelProps) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (model: ModelCreateRequest) =>
      modelsService.create(model, props?.namespace),
    onSuccess: model => {
      toast.success('Model Created', {
        description: `Successfully created ${model.name}`,
      });

      queryClient.invalidateQueries({ queryKey: [GET_ALL_MODELS_QUERY_KEY] });

      if (props?.onSuccess) {
        props.onSuccess();
      }
    },
    onError: (error: unknown, data) => {
      const getMessage = () => {
        if (error instanceof Error) {
          return error.message;
        }
        return 'An unexpected error occurred';
      };

      toast.error(`Failed to create Model: ${data.name}`, {
        description: getMessage(),
      });
    },
  });
};

type UseGetModelbyIdProps = {
  modelId: string | number;
  namespace?: string;
};

export const useGetModelbyId = ({
  modelId,
  namespace,
}: UseGetModelbyIdProps) => {
  const query = useQuery({
    queryKey: [GET_MODEL_BY_ID_QUERY_KEY, modelId, namespace],
    queryFn: () => modelsService.getById(modelId, namespace),
  });

  useEffect(() => {
    if (query.error) {
      toast.error(`Failed to get Model: ${modelId}`, {
        description:
          query.error instanceof Error
            ? query.error.message
            : 'An unexpected error occurred',
      });
    }
  }, [query.error, modelId]);

  return query;
};

type UseUpdateModelByIdProps = {
  namespace?: string;
};

export const useUpdateModelById = (props?: UseUpdateModelByIdProps) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: ModelUpdateRequest & { id: string }) => {
      return modelsService.updateById(id, data, props?.namespace);
    },
    onSuccess: model => {
      toast.success('Model Updated', {
        description: `Successfully updated ${model?.id}`,
      });

      queryClient.invalidateQueries({ queryKey: [GET_ALL_MODELS_QUERY_KEY] });
      if (model?.id) {
        queryClient.invalidateQueries({
          queryKey: [GET_MODEL_BY_ID_QUERY_KEY, model.id],
        });
      }
    },
    onError: (error: unknown, data) => {
      const getMessage = () => {
        if (error instanceof Error) {
          return error.message;
        }
        return 'An unexpected error occurred';
      };

      toast.error(`Failed to update Model: ${data.id}`, {
        description: getMessage(),
      });
    },
  });
};
