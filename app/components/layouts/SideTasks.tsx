'use client';

import { Drawer, ActionIcon, Badge, Tabs, LoadingOverlay, Indicator, Tooltip, Button } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconChecklist, IconList, IconCircleDashedCheck } from '@tabler/icons-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import LoadingBox from '@/components/generic/LoadingBox';
import { TaskStatus, TaskType } from '@/prisma/client';
import { getAssignedTasks, startTask } from '@/services/backend/tasks';
import { AssignedTask } from '@/types/task';
import { formatDate, cn } from '@/utils/js';

const taskTypeLabels = {
  [TaskType.SIGN_PUBLIC_CLOUD_MOU]: 'Sign Public Cloud MOU',
  [TaskType.REVIEW_PUBLIC_CLOUD_MOU]: 'Review Public Cloud MOU',
  [TaskType.REVIEW_PRIVATE_CLOUD_REQUEST]: 'Review Private Cloud Request',
  [TaskType.REVIEW_PUBLIC_CLOUD_REQUEST]: 'Review Public Cloud Request',
};

function Task({ task, onAction }: { task: AssignedTask; onAction: () => void }) {
  const router = useRouter();
  const { mutateAsync: _startTask, isPending: isStartingTask } = useMutation({
    mutationFn: startTask,
  });

  const type = taskTypeLabels[task.type];
  const isStarted = task.status === TaskStatus.STARTED;
  return (
    <div key={task.id} className="hover:bg-gray-100 transition-colors duration-200 flex flex-gap-2 px-4 py-3">
      <div className="flex-[2]">
        <div>
          <span className="font-semibold">{type}</span>
        </div>
        <div className="text-sm italic text-gray-700">{task.description}</div>
        <div className="text-sm text-gray-400">Created at {formatDate(task.createdAt)}</div>
        {isStarted && (
          <>
            <div className="text-sm text-gray-400">Started at {formatDate(task.startedAt)}</div>
            <div className="text-sm text-gray-400">Started by {task.startedByUser?.email}</div>
          </>
        )}
      </div>
      <div className="flex-[1] text-right">
        {task.link && (
          <Button
            color={isStarted ? 'success' : 'primary'}
            size="compact-xs"
            onClick={async () => {
              if (!isStarted) {
                if (isStartingTask) return;
                await _startTask(task.id);
              }

              onAction();
              router.push(task.link);
            }}
          >
            {isStarted ? 'View' : 'Start'}
          </Button>
        )}
      </div>
    </div>
  );
}

function Tasks({ tasks, onAction }: { tasks: AssignedTask[]; onAction: () => void }) {
  if (tasks.length === 0) {
    return <div className="italic">No tasks found.</div>;
  }

  return tasks.map((task) => {
    return <Task key={task.id} task={task} onAction={onAction} />;
  });
}

export default function SideTasks({ className }: { className?: string }) {
  const [opened, { open, close }] = useDisclosure(false);
  const {
    data: tasks,
    isLoading,
    refetch: refetchTasks,
  } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => getAssignedTasks(),
    refetchInterval: 3000,
  });

  useEffect(() => {
    if (opened) refetchTasks();
  }, [opened, refetchTasks]);

  const pendingTasks = (tasks || []).filter((task) => task.status === TaskStatus.ASSIGNED);
  const startedTasks = (tasks || []).filter((task) => task.status === TaskStatus.STARTED);

  return (
    <>
      <Drawer opened={opened} onClose={close} title="Tasks">
        <LoadingBox className="min-h-96" isLoading={isLoading}>
          <Tabs defaultValue="pending">
            <Tabs.List>
              <Tabs.Tab value="pending" leftSection={<IconList size={12} />}>
                Pending
              </Tabs.Tab>
              <Tabs.Tab value="started" leftSection={<IconCircleDashedCheck size={12} />}>
                Started
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="pending">
              <Tasks tasks={pendingTasks} onAction={close} />
            </Tabs.Panel>
            <Tabs.Panel value="started">
              <Tasks tasks={startedTasks} onAction={close} />
            </Tabs.Panel>
          </Tabs>
        </LoadingBox>
      </Drawer>
      <Indicator inline processing={pendingTasks.length > 0} position="top-start" label={pendingTasks.length} size={16}>
        <Tooltip label="Tasks">
          <ActionIcon
            size={40}
            variant="light"
            aria-label="Tasks"
            onClick={open}
            className={cn(
              'bg-bcblue border-1 rounded-lg hover:rounded-full text-white border-white hover:text-white',
              className,
            )}
          >
            <IconChecklist size={30} stroke={1.5} />
          </ActionIcon>
        </Tooltip>
      </Indicator>
    </>
  );
}
