import { useQuery } from '@tanstack/react-query';

import { agentsService } from './agents';

export const GET_ALL_AGENTS_QUERY_KEY = 'get-all-agents';

type UseGetAllAgentsProps = {
  namespace?: string;
};

export const useGetAllAgents = (props?: UseGetAllAgentsProps) => {
  return useQuery({
    queryKey: [GET_ALL_AGENTS_QUERY_KEY, props?.namespace],
    queryFn: () => agentsService.getAll(props?.namespace),
  });
};
