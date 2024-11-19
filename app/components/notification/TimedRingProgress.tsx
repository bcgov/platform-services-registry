import { Center, RingProgress, ThemeIcon } from '@mantine/core';
import { useInterval } from '@mantine/hooks';
import { IconArchive } from '@tabler/icons-react';
import { useState, useEffect } from 'react';

const ms = 100;

export function TimedRingProgress({
  color,
  duration,
  onFinish,
}: {
  color: string;
  duration: number;
  onFinish: () => void;
}) {
  const [seconds, setSeconds] = useState(0);
  const interval = useInterval(() => {
    if (seconds >= duration) onFinish();
    else setSeconds((s) => s + ms);
  }, ms);

  useEffect(() => {
    interval.start();
    return interval.stop;
  }, []);

  return (
    <RingProgress
      color={color}
      size={44}
      thickness={5}
      sections={[{ value: (seconds / duration) * 100, color }]}
      label={
        <Center>
          <ThemeIcon radius="xl" color={color}>
            <IconArchive size={16} />
          </ThemeIcon>
        </Center>
      }
    />
  );
}
