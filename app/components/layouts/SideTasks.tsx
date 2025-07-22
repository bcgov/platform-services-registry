'use client';

import { Drawer, ActionIcon, Badge, Box, LoadingOverlay, Indicator, Tooltip, Button } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconChecklist } from '@tabler/icons-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useEffect } from 'react';
import { TaskStatus, TaskType } from '@/prisma/client';
import { getAssignedTasks, startTask } from '@/services/backend/tasks';
import { formatDate, cn } from '@/utils/js';

const taskTypeLabels = {
  [TaskType.SIGN_PUBLIC_CLOUD_MOU]: 'Sign Public Cloud MOU',
  [TaskType.REVIEW_PUBLIC_CLOUD_MOU]: 'Review Public Cloud MOU',
  [TaskType.REVIEW_PRIVATE_CLOUD_REQUEST]: 'Review Private Cloud Request',
  [TaskType.REVIEW_PUBLIC_CLOUD_REQUEST]: 'Review Public Cloud Request',
};

const taskStatusColors = {
  [TaskStatus.ASSIGNED]: 'primary',
  [TaskStatus.COMPLETED]: 'success',
  [TaskStatus.STARTED]: 'info',
};

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

  const { mutateAsync: _startTask, isPending: isStartingTask } = useMutation({
    mutationFn: startTask,
  });

  useEffect(() => {
    if (opened) refetchTasks();
  }, [opened, refetchTasks]);

  const _tasks = tasks || [];

  return (
    <>
      <Drawer opened={opened} onClose={close} title="Tasks">
        <Box pos="relative" className="min-h-96">
          <LoadingOverlay visible={isLoading} zIndex={1000} overlayProps={{ radius: 'sm', blur: 2 }} />

          {_tasks.length === 0 ? (
            <div className="italic">No tasks assigned.</div>
          ) : (
            _tasks.map((task) => {
              const type = taskTypeLabels[task.type];
              const color = taskStatusColors[task.status];
              const isStarted = task.status === TaskStatus.STARTED;
              return (
                <div
                  key={task.id}
                  className="hover:bg-gray-100 transition-colors duration-200 grid grid-cols-5 gap-4 px-4 py-3"
                >
                  <div className="col-span-4">
                    <div>
                      <span className="font-semibold">{type}</span>
                      <Badge color={color} size="sm" radius="sm" className="ml-1">
                        {task.status}
                      </Badge>
                      {!isStarted && (
                        <Button
                          color="info"
                          className="ml-2"
                          size="xs"
                          loading={false}
                          onClick={async () => {
                            if (isStartingTask) return;
                            await _startTask(task.id);
                          }}
                        >
                          Mark as Started
                        </Button>
                      )}
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
                  <div className="col-span-1 text-right">
                    {task.link && (
                      <Link
                        href={task.link}
                        onClick={close}
                        className="text-blue-600 hover:underline font-bold text-base"
                      >
                        link
                      </Link>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </Box>
      </Drawer>
      <Indicator inline processing={_tasks.length > 0} position="top-start" label={_tasks.length} size={16}>
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
