import { Button, Tooltip } from '@mantine/core';

export default function ZoomButton({
  action,
  icon,
  zoomHandler,
  disabled = false,
  toolTipLabel = 'Zoom bar height',
}: {
  action: '+' | 'reset';
  icon: React.ReactNode;
  zoomHandler: (action: '+' | 'reset') => void;
  disabled?: boolean;
  toolTipLabel?: string;
}) {
  return (
    <Tooltip label={toolTipLabel} position="top" withArrow>
      <div>
        <Button
          variant="outline"
          color="gray"
          className="w-10 h-10 p-0 grid place-items-center"
          onClick={() => zoomHandler(action)}
          disabled={disabled}
        >
          {icon}
        </Button>
      </div>
    </Tooltip>
  );
}
