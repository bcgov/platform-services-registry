import { createGlobalValtio } from '@/helpers/valtio';
import { AssignedTask } from '@/types/task';

export const { state: userState, useValtioState: useUserState } = createGlobalValtio<{
  assignedTasks: AssignedTask[];
}>({
  assignedTasks: [],
});
