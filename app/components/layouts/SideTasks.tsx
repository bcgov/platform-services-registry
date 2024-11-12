'use client';

import { Drawer, ActionIcon, Badge, Box, LoadingOverlay, Indicator, Tooltip } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { TaskStatus, TaskType } from '@prisma/client';
import { IconChecklist } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import classnames from 'classnames';
import Link from 'next/link';
import { useEffect } from 'react';
import { getAssignedTasks } from '@/services/backend/tasks';
import { formatDate } from '@/utils/date';

const taskTypeLabels = {
  [TaskType.SIGN_PUBLIC_CLOUD_MOU]: 'Sign Private Cloud MOU',
  [TaskType.REVIEW_PUBLIC_CLOUD_MOU]: 'Review Public Cloud MOU',
};

const taskStatusColors = {
  [TaskStatus.ASSIGNED]: 'primary',
  [TaskStatus.COMPLETED]: 'success',
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
    refetchInterval: 5000,
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
                    </div>
                    <div className="text-sm italic text-gray-700">{task.description}</div>
                    <div className="text-sm text-gray-400">{formatDate(task.createdAt)}</div>
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
            className={classnames(
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
